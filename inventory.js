// inventory.js - CRUD operations, search, sort, localStorage persistence
(function(){
  // elements
  const itemsTableBody = document.querySelector('#itemsTable tbody');
  const itemForm = document.getElementById('itemForm');
  const addBtn = document.getElementById('addBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const formPanel = document.getElementById('formPanel');
  const formTitle = document.getElementById('formTitle');
  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sortBy');
  const summary = document.getElementById('summary');

  let editId = null;

  function getItems(){ try{ return JSON.parse(localStorage.getItem('ims_items')||'[]') }catch(e){return[]} }
  function saveItems(items){ localStorage.setItem('ims_items', JSON.stringify(items)) }

  function render(){
    const q = (searchInput.value||'').toLowerCase();
    let items = getItems();

    // filter
    if(q) items = items.filter(it => (it.name||'').toLowerCase().includes(q) || (it.sku||'').toLowerCase().includes(q));

    // sort
    const s = sortSelect.value || 'created_desc';
    items.sort((a,b)=>{
      if(s==='name_asc') return a.name.localeCompare(b.name);
      if(s==='name_desc') return b.name.localeCompare(a.name);
      if(s==='created_asc') return a.created - b.created;
      if(s==='created_desc') return b.created - a.created;
      if(s==='qty_asc') return a.qty - b.qty;
      if(s==='qty_desc') return b.qty - a.qty;
      return 0;
    });

    // populate table
    itemsTableBody.innerHTML = '';
    items.forEach(it=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(it.name)}</td>
                      <td>${escapeHtml(it.sku||'—')}</td>
                      <td>${it.qty}</td>
                      <td>₹ ${Number(it.price).toFixed(2)}</td>
                      <td>
                        <button class="btn" data-id="${it.id}" data-action="edit">Edit</button>
                        <button class="btn btn-ghost" data-id="${it.id}" data-action="del">Delete</button>
                      </td>`;
      itemsTableBody.appendChild(tr);
    });

    summary.textContent = items.length + ' item(s) shown.';
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]}) }

  // form open for add
  addBtn.addEventListener('click', ()=>{
    editId = null;
    formTitle.textContent = 'Add item';
    itemForm.reset();
    document.getElementById('itemQty').value = 1;
    document.getElementById('itemPrice').value = '0.00';
    window.scrollTo({top:0,behavior:'smooth'});
  });

  cancelBtn.addEventListener('click', ()=>{ itemForm.reset(); editId=null; formTitle.textContent='Add item'; });

  // submit add/edit
  itemForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const qty = Number(document.getElementById('itemQty').value) || 0;
    const price = Number(document.getElementById('itemPrice').value) || 0;

    let items = getItems();
    if(editId){
      const idx = items.findIndex(i=>i.id===editId);
      if(idx>-1){
        items[idx] = {...items[idx], name, sku, qty, price};
      }
      editId = null;
      formTitle.textContent = 'Add item';
    } else {
      items.unshift({id:Date.now(), name, sku, qty, price, created:Date.now()});
    }
    saveItems(items);
    itemForm.reset();
    render();
  });

  // delegate edit/delete
  itemsTableBody.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    let items = getItems();
    if(action==='del'){
      if(!confirm('Delete this item?')) return;
      items = items.filter(i=>i.id!==id);
      saveItems(items);
      render();
    } else if(action==='edit'){
      const it = items.find(i=>i.id===id);
      if(!it) return;
      editId = id;
      formTitle.textContent = 'Edit item';
      document.getElementById('itemName').value = it.name;
      document.getElementById('itemSKU').value = it.sku||'';
      document.getElementById('itemQty').value = it.qty;
      document.getElementById('itemPrice').value = it.price;
      window.scrollTo({top:0,behavior:'smooth'});
    }
  });

  // search/sort listeners
  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);

  // initial render
  render();

  // small helper: demo seed data if empty
  if(getItems().length===0){
    saveItems([
      {id:Date.now()+1, name:'Starter Pack', sku:'SP-001', qty:12, price:199.99, created:Date.now()-20000},
      {id:Date.now()+2, name:'Wires & Cables', sku:'WC-210', qty:52, price:49.5, created:Date.now()-15000},
    ]);
    render();
  }

})();
