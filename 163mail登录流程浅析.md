## 163mail登录浅析
最近因业务需要研究了一下163邮箱登录流程，主要难点是登录验证码和两个cookie，密码rsa加密。mail.163.com登录有时是图形验证码，有时是网易易盾的点选汉字验证，对请求次数多的ip采用点选汉字验证。图形验证码当然更容易解析，而163.com主站登录为图形验证码，为了简便以此为例。
抓包分析请求的话直接用chrome开发者工具即可，记得勾选preserve log。其中有两个重要的cookie：JSESSIONID-WYTXZDL和jsessionid-cpta，以及密码rsa加密算法。

### JSESSIONID-WYTXZDL
JSESSIONID-WYTXZDL是通过js脚本进行设置的，具体代码在[这个请求](https://dl.reg.163.com/src/mp-agent-finger.html)中。

代码是经过压缩和转义的，首先通过http://jsnice.org/格式化代码，然后通过debugger可以清晰的看到它做了什么。主要设置了JSESSIONID-WYTXZDL的值，并将未编码过的值暴露给了window对象。我们通过encodeURIComponent(window.jsessionidwytxzdl)就能拿到完整的值。

### jsessionid-cpta
同样jsessionid-cpta也是通过js进行设置的，具体代码在[这个请求](http://ursdoccdn.nosdn.127.net/captcha/c_2.2.2.js)中，值同样暴露给了window对象。我们通过encodeURIComponent(window.jsessionidcpta)拿到值。

### 密码rsa加密算法
输入帐号密码完成图形验证后，点击登录的请求中可以看到密码是加密过的。经过查找加密算法代码在[这个请求](http://ursdoccdn.nosdn.127.net/webzj_cdn101/pp_index_dl_288a2baadb6e36e09a52563f2870b684.js)中。加密算法为MP.encrypt2方法，因脚本文件比较大，可以把加密算法部分单独拿出来。

### 通过HTTP client模拟请求
有了上面3个值就可以通过HTTP client模拟请求登录了。因为3个值都是通过js设置的，服务端语言选择node就很方便了。图形验证码可以通过本地请求163真实的验证码并手动输入验证。登录请求比较多，这里就不贴了，主要是cookie和请求返回值的处理。

##### 注
因请求文件版本不同，三个请求地址可能会有变化，这里作为参考。

JSESSIONID-WYTXZDL: https://dl.reg.163.com/src/mp-agent-finger.html

jsessionid-cpta: http://ursdoccdn.nosdn.127.net/captcha/c_2.2.2.js

rsa加密算法: http://ursdoccdn.nosdn.127.net/webzj_cdn101/pp_index_dl_288a2baadb6e36e09a52563f2870b684.js