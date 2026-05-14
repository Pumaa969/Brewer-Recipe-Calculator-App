const Storage = {
	key: 'brc_recipes',
	getAll(){
		const raw = localStorage.getItem(this.key);
		return raw ? JSON.parse(raw) : [];
	},
	save(recipe){
		const list = this.getAll();
		list.push(recipe);
		localStorage.setItem(this.key, JSON.stringify(list));
	},
	update(recipe){
		const list = this.getAll().map(r => r.id === recipe.id ? recipe : r);
		localStorage.setItem(this.key, JSON.stringify(list));
	},
	get(id){
		return this.getAll().find(r=>r.id===id);
	},
	remove(id){
		const list = this.getAll().filter(r=>r.id!==id);
		localStorage.setItem(this.key, JSON.stringify(list));
	}
}
