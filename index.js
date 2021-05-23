const fs = require('fs-extra')
const _ = require('lodash')

const main = async ()=>{
	// odczytywanie danych z pliku - zamienić na odczyt z bazy
	const input = JSON.parse((await fs.readFile('input.json')).toString());

	// start timera - można usunąć
	console.time("done")

	// groupowanie po wartości medium_id. 
	// Zamiast [{obiekt}, {obiekt}, {obiekt}] mamy {1:[{obiekt}, {obiekt}], 2:[{obiekt}, {obiekt}]}
	// w php można to samo osiągnąć przez:
	// 1. bibliotekę https://github.com/jakezatecky/array_group_by
	// 2. lokalną funkcje https://stackoverflow.com/a/39208133
	const grouped = _.groupBy(input, 'medium_id');

	// iterujemy po każdej właściwości obiektu grouped
	// value to tablica obiektów tego samego medium
	for(const [key, value] of Object.entries(grouped)){

		// szukamy obiektu ktory ma null jako parent_id, 
		// w jednym medium powinien być przynajmniej jeden taki obiekt
		// jeśli bedzie wiecej niż jeden, obiekt ten nie pojawi się na drzewie
		const startNode = value.find(elem=>elem.parent_id===null);

		// usuwamy właściwość parent_id dla korzenia drzewa ze wzgledów czysto estetycznych
		startNode.parent_id = undefined;

		// generujemy drzewo i zamieniamy na sformatowany JSON
		// stała output to string drzewa jednego medium(medium_id jest dostepne w stałej key)
		// możemy wysłać ją w odpowiedzi na zapytanie
		const output = JSON.stringify(generateTree(startNode, value), null, 2)
	}

	//output do benchmarku
	console.log("objects: "+input.length)
	console.timeEnd("done")
}

const generateTree = (branch, list)=>{

	// szukamy WSZYSTKIE dzieci aktualnego rodzica(zmienna branch). 
	// Na początku rodzic to ten obiekt ktorego szukamy w linii 25, potem jego dzieci 
	// children to tablica dzieci(lub pusta gdy nic nie znaleziono)
	let children = list.filter(elem=>elem.parent_id===branch.id);

	// usuwamy właściwość medium_id ze wszystkich obiektów oprócz korzenia bo jest już on zapisany w korzeniu, 
	// nie ma sensu duplikować danych
	children = children.map(elem=>{
		elem.medium_id=undefined;
		return elem
	})

	//do aktualnego rodzica przypisujemy znalezione dzieci którym po kolei szukamy dzieci
	branch.children = children.map(elem=>generateTree(elem, list))
	return branch;
}


main();