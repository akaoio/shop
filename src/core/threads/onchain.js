import { events } from "/core/Events.js"
import { Context } from "/core/Context.js"
import { Indexes, Statics, Chains, Dexs, Wallets } from "/core/Stores.js"
import Thread from "/core/Thread.js"
import { loop } from "/core/Utils/loop.js"
import { Construct } from "/core/Construct.js"
import { loadContract } from "/core/core/Utils/contracts.js"
import { clone } from "/core/Utils/data.js"
import { authenticate } from "/core/Gun.js"

const thread = new Thread()

events.on("authenticate", function () {
    if (!Context.get("authenticated")) return
    thread.scanBalances()
})

thread.init = async function () {
    await Construct.Chains()
    await Construct.Dexs()
    await Construct.Wallets()
    await Construct.DB()
    await Construct.User()
    // Start scanning pools and update to main thread's Lives object
    thread.scanPools()
    // Start listening for new blocks
    // thread.listenForNewBlocks()
}

thread.authenticate = async function (pair) {
    if (!thread.initialized || Context.get("authenticated")) return
    pair = pair || (await Indexes.Auth.get("pair").once())
    if (pair && !Context.get("authenticated")) authenticate(pair)
}

// This method is used to create new Wallets
thread.wallets = async function ({ seed } = {}) {
    await Construct.Wallets({ seed })
}

thread.scanPools = function () {
    Object.entries(Statics.defis).forEach(([id, configs]) => {
        const chain = Chains[configs.chain]
        if (!chain) return
        const dex = Dexs[id]
        if (!dex) return
        const pools = configs.pools
        if (!pools || !pools.length) return
        loop({
            data: pools,
            process: async (address) => {
                try {
                    const pool = await loadContract({ chain: chain.id, address })
                    if (!pool) throw new Error(`Pool not found on chain ${chain.id}: ${address}`)

                    // Get token references without spreading
                    const token0 = { configs: await loadContract({ chain: chain.id, address: pool.token0 }) }
                    const token1 = { configs: await loadContract({ chain: chain.id, address: pool.token1 }) }
                    if (!token0.configs || !token1.configs) return console.error(`Tokens not found for pool ${pool.address}`)

                    // Get current rates
                    const rates = await dex.getRate({ pool: address })
                    if (rates.error) return console.error(`Failed to get rates for pool ${pool.address} on chain ${chain.id}:`, rates.error)

                    // Create token data objects efficiently
                    Object.assign(token0, rates.token0, { address: pool.token0 })
                    Object.assign(token1, rates.token1, { address: pool.token1 })

                    // Calculate 24h changes only if we have valid rates
                    // if (rates.token0?.rate > 0 && rates.token1?.rate > 0 && chain?.block?.number && chain?.duration) {
                    //     const last = Number(chain.block.number) - Math.floor(24 * 60 * 60 / chain.duration)
                    //     const block = await chain.https.getBlock(last)

                    //     if (block) {
                    //         const lastRates = await dex.getRate({ pool: address, block: last })
                    //         if (!lastRates.error && lastRates.token0?.rate > 0 && lastRates.token1?.rate > 0) {
                    //             token0.change24h = ((rates.token0.rate - lastRates.token0.rate) / lastRates.token0.rate) * 100
                    //             token1.change24h = ((rates.token1.rate - lastRates.token1.rate) / lastRates.token1.rate) * 100
                    //         }
                    //     }
                    // }

                    // Build unified result object combining pool info and rates
                    const data = {
                        ...pool,
                        token0: token0,
                        token1: token1,
                        pairs:
                            token0.rate > 0 || token1.rate > 0
                                ? {
                                    [pool.token0]: {
                                        [pool.token1]: token0.rate > 0 ? token0.rate : undefined
                                    },
                                    [pool.token1]: {
                                        [pool.token0]: token1.rate > 0 ? token1.rate : undefined
                                    }
                                }
                                : undefined
                    }
                    Indexes.Lives.get("pools").get(dex.id).get(pool.address).put(data)
                    return { pools: { [pool.chain]: { [pool.address]: data } } }
                } catch (error) {
                    console.error(`Error processing pool ${address}:`, error)
                    return null
                }
            },
            callback: (result) => thread.send({ Lives: clone(result) }),
            delay: [0, 10000]
        })
    })
}

// This method is used to scan the balances for the authenticated user
thread.scanBalances = function () {
    // Process all chains simultaneously
    Object.entries(Statics.chains).forEach(([id, configs]) => {
        const chain = Chains[id]
        if (!chain) return
        const wallet = Wallets[id]
        if (!wallet) return
        const currencies = configs.currencies
        if (!currencies || !currencies.length) return
        loop({
            data: currencies,
            process: async (address) => {
                try {
                    const currency = await loadContract({ chain: chain.id, address })
                    if (!currency) return

                    // Get balance directly
                    const balance = await wallet.balance({ currency })
                    if (balance === null || balance === undefined) {
                        console.error(`Failed to get balance for ${currency.name} on chain ${chain.id}`)
                        return null
                    }

                    // Return minimal object structure
                    return { balances: { [currency.chain]: { [address]: balance } } }
                } catch (error) {
                    console.error(`Error fetching balance for ${address} on chain ${id}:`, error)
                    return null
                }
            },
            callback: (result) => thread.send({ Lives: clone(result) }),
            delay: [0, 10000]
        })
    })
}

// Listen for new blocks on all chains
thread.listenForNewBlocks = function () {
    Object.entries(Statics.chains).forEach(([id, configs]) => {
        const chain = Chains[id]
        // Skip if no WebSocket connection available
        if (!chain?.wss) {
            return console.log(`No WebSocket connection available for chain ${id}`)
        }

        // This part is working but commented out just for now, we are dealing with other problems.
        // chain.wss.eth.subscribe('newBlockHeaders')
        //     .then(subscription => {
        //         subscription.on('data', async block => {
        //             console.log(`New block on chain ${name}:`, block.number)
        //             // Get full block details including transactions using HTTPS endpoint
        //             const fullBlock = await chain.https.getBlock(block.number, true)
        //             if (fullBlock && fullBlock.transactions) {
        //                 console.log(`Found ${fullBlock.transactions.length} transactions in block ${block.number}`)
        //                 fullBlock.transactions.forEach(tx => {
        //                     console.log(`Transaction: ${tx.hash}`)
        //                     console.log(`From: ${tx.from}`)
        //                     console.log(`To: ${tx.to}`)
        //                     console.log(`Value: ${tx.value}`)
        //                 })
        //             }
        //         })
        //     })
    })
}
