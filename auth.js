// auth.js - handles register/login/localStorage
(function(){
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  function getUsers(){
    try{ return JSON.parse(localStorage.getItem('ims_users')||'[]') }catch(e){ return [] }
  }
  function saveUsers(users){ localStorage.setItem('ims_users', JSON.stringify(users)) }

  if(registerForm){
    registerForm.addEventListener('submit', e=>{
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      let users = getUsers();
      if(users.find(u=>u.email===email)){
        alert('An account with this email already exists.');
        return;
      }
      users.push({id:Date.now(), name, email, password});
      saveUsers(users);
      alert('Registered! Please login.');
      location.href = 'login.html';
    });
  }

  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      let users = getUsers();
      const user = users.find(u=>u.email===email && u.password===password);
      if(!user){ alert('Invalid credentials.'); return; }
      localStorage.setItem('ims_currentUser', JSON.stringify({id:user.id, name:user.name, email:user.email}));
      location.href = 'inventory.html';
    });
  }

  // If on inventory page, check login
  if(location.pathname.endsWith('inventory.html')){
    const current = localStorage.getItem('ims_currentUser');
    if(!current){ alert('Please login first.'); location.href='login.html'; }
  }

  // logout button (if present)
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
      localStorage.removeItem('ims_currentUser');
      location.href = 'login.html';
    });
  }

  // display welcome name if present
  const welcomeText = document.getElementById('welcomeText');
  if(welcomeText){
    const cur = JSON.parse(localStorage.getItem('ims_currentUser')||'null');
    if(cur) welcomeText.textContent = 'Hi, '+cur.name;
  }
})();