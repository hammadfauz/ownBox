//var form = document.getElementById('loginForm');
//var loginBtn = document.getElementById('loginBtn');
//loginBtn.onclick = function () {
//    loginForm.submit();
//};
var loginForm = document.getElementById('loginForm');
loginForm.action = '/1/oauth2/authorize' + location.search;
