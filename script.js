
// script.js
window.onload = () => {
  document.querySelector('.fade-down').classList.add('animate-down');
  document.querySelector('.slide-left').classList.add('animate-left');
  document.querySelector('.slide-right').classList.add('animate-right');
  document.querySelector('.fade-up').classList.add('animate-up');
};

const style = document.createElement('style');
style.innerHTML = `
.animate-down{animation:down .8s forwards;} 
.animate-left{animation:left .8s .2s forwards;} 
.animate-right{animation:right .8s .4s forwards;} 
.animate-up{animation:up .8s .6s forwards;} 
@keyframes down{from{opacity:0;top:-30px}to{opacity:1;top:0}}
@keyframes left{from{opacity:0;left:-30px}to{opacity:1;left:0}}
@keyframes right{from{opacity:0;left:30px}to{opacity:1;left:0}}
@keyframes up{from{opacity:0;top:30px}to{opacity:1;top:0}}
`;
document.head.appendChild(style);

const response = await fetch('https://your-backend.onrender.com/api/request', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
});
