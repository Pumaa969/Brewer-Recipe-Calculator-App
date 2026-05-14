function uid(){
	return 'id-' + Date.now() + '-' + Math.floor(Math.random()*1000);
}

function createFermentableRow(f){
	const tr = document.createElement('tr');
	tr.innerHTML = `
		<td><input class="f-name" value="${f?.name||''}"></td>
		<td><input class="f-kg" type="number" step="0.01" value="${f?.kg||0}"></td>
		<td><input class="f-ppg" type="number" step="0.1" value="${f?.ppg||300}"></td>
		<td><input class="f-ebc" type="number" step="0.1" value="${f?.ebc||10}"></td>
		<td><button class="remove">X</button></td>
	`;
	tr.querySelector('.remove').addEventListener('click', ()=> tr.remove());
	return tr;
}

function collectFermentables(){
	const rows = Array.from(document.querySelectorAll('#fermentablesTable tbody tr'));
	return rows.map(r=>({
		name: r.querySelector('.f-name').value,
		kg: parseFloat(r.querySelector('.f-kg').value) || 0,
		ppg: parseFloat(r.querySelector('.f-ppg').value) || 0,
		ebc: parseFloat(r.querySelector('.f-ebc').value) || 0,
	})).filter(f=>f.kg>0);
}

function renderResults(fermentables, volumen, eficiencia, attenMin, attenMax){
	const results = document.getElementById('results');
	const og = Calc.og(fermentables, volumen, eficiencia);
	const fg = Calc.fg(og, attenMin, attenMax);
	const abv = Calc.abv(og, fg);
	const srm = Calc.srm(fermentables, volumen);
	results.innerHTML = `
		<p>OG: ${og.toFixed(3)}</p>
		<p>FG: ${fg.toFixed(3)}</p>
		<p>ABV: ${abv.toFixed(2)}%</p>
		<p>SRM estimado: ${srm.toFixed(1)}</p>
	`;
}

document.addEventListener('DOMContentLoaded', ()=>{
	const addBtn = document.getElementById('addFermentable');
	if(addBtn){
		const tbody = document.querySelector('#fermentablesTable tbody');
		tbody.appendChild(createFermentableRow());
		addBtn.addEventListener('click', ()=> tbody.appendChild(createFermentableRow()));

		const form = document.getElementById('recipeForm');
		const inputs = ['volumen','eficiencia','attenMin','attenMax'];

		function updatePreview(){
			const fermentables = collectFermentables();
			const volumen = parseFloat(document.getElementById('volumen').value) || 0;
			const eficiencia = parseFloat(document.getElementById('eficiencia').value) || 75;
			const attenMin = parseFloat(document.getElementById('attenMin').value) || 70;
			const attenMax = parseFloat(document.getElementById('attenMax').value) || 75;
			renderResults(fermentables, volumen, eficiencia, attenMin, attenMax);
		}

		form.addEventListener('input', updatePreview);

		form.addEventListener('submit', (e)=>{
			e.preventDefault();
			const name = document.getElementById('name').value || 'Sin nombre';
			const volumen = parseFloat(document.getElementById('volumen').value) || 0;
			const eficiencia = parseFloat(document.getElementById('eficiencia').value) || 75;
			const attenMin = parseFloat(document.getElementById('attenMin').value) || 70;
			const attenMax = parseFloat(document.getElementById('attenMax').value) || 75;
			const fermentables = collectFermentables();
			const og = Calc.og(fermentables, volumen, eficiencia);
			const fg = Calc.fg(og, attenMin, attenMax);
			const abv = Calc.abv(og, fg);
			const srm = Calc.srm(fermentables, volumen);

			const recipe = {
				id: uid(),
				name,
				volumen,
				eficiencia,
				attenMin,
				attenMax,
				fermentables,
				computed: {og,fg,abv,srm},
				createdAt: new Date().toISOString()
			};

			Storage.save(recipe);
			window.location.href = '/recetas';
		});
	}

	// previous recipes page
	const listEl = document.getElementById('recipesList');
	if(listEl){
		function renderList(){
			const all = Storage.getAll();
			listEl.innerHTML = '';
			if(!all.length) listEl.innerHTML = '<p>No hay recetas guardadas.</p>';
			all.forEach(r=>{
				const div = document.createElement('div');
				div.className = 'recipe-card';
				div.innerHTML = `
					<h4>${r.name}</h4>
					<p>Vol ${r.volumen} L · OG ${r.computed?.og?.toFixed(3)||'-' } · ABV ${r.computed?.abv?.toFixed(2)||'-'}%</p>
					<button data-id="${r.id}" class="view">Ver</button>
					<button data-id="${r.id}" class="delete">Borrar</button>
				`;
				listEl.appendChild(div);
			});

			document.querySelectorAll('.view').forEach(b=>b.addEventListener('click', (ev)=>{
				const id = ev.target.dataset.id;
				const recipe = Storage.get(id);
				const detail = document.getElementById('recipeDetail');
				detail.innerHTML = `<h3>${recipe.name}</h3>
					<p>Volumen: ${recipe.volumen} L</p>
					<p>Eficiencia: ${recipe.eficiencia}%</p>
					<p>OG: ${recipe.computed.og.toFixed(3)}</p>
					<p>FG: ${recipe.computed.fg.toFixed(3)}</p>
					<p>ABV: ${recipe.computed.abv.toFixed(2)}%</p>
					<p>SRM: ${recipe.computed.srm.toFixed(1)}</p>
					<h4>Fermentables</h4>
					<ul>` + recipe.fermentables.map(f=>`<li>${f.name} — ${f.kg} kg — PPG ${f.ppg} — EBC ${f.ebc}</li>`).join('') + `</ul>`;
			}));

			document.querySelectorAll('.delete').forEach(b=>b.addEventListener('click', (ev)=>{
				const id = ev.target.dataset.id;
				if(confirm('Borrar receta?')){
					Storage.remove(id);
					renderList();
					document.getElementById('recipeDetail').innerHTML='';
				}
			}));
		}
		renderList();
	}
});
