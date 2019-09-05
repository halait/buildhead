let h = document.getElementById("lol");
let xhr = new XMLHttpRequest();
xhr.open("GET", "warmstart_test.json");
//xhr.responseType = "json";
xhr.onload = function(){
  console.log(xhr.response);
  h.textContent = xhr.response;
}
xhr.send();
