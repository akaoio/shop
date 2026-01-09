Currently the architecture of UI.html doesn't allow nested UI.html. This leads to having to create many UI components that are not usually used.

For example, this is desired usage:
```js
const test = html`<div>Lorem ipsum ${someArray.map(e => html`<p>${e.value}</p>`)}</div>`
```

Or another way of use: 
```js
const test = html`<div>Hello ${html`<a>world</a>`}</div>`
```

Để làm được điều này cần phải thay đổi lớn về kiến trúc.

1. html`` chỉ trả về object chứa strings, values. Với từng value => trả về chuỗi html comment làm marker: <!--mark:i--> trong đó i là số index của value tương ứng.

2. kết quả từ html`` sẽ được đưa vào hàm render() (chưa có) để từ đó sinh ra DOM template node.


Kiến trúc hiện tại cho phép lồng html trong html nhưng nó chỉ xử lý string thô, không phải node, nên không thể thao túng.