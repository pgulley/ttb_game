
class World{
	constructor(){
		this.time = 0
		this.user ="default" //set at game creation.  
		this.farm = new Farm()
		this.climate = new Climate()
	}
	tick(){
		this.time++
		//update the climate
		this.climate.tick(this.time)
		//apply the climate to the farm
		this.farm.tick(this.time,this.climate)
	}
}


class Farm {
	constructor(){
		this.state = {
			soil_rad:10
		}
		this.plants = []
		this.structures = []
	}
	
	tick(time, climate) {
		console.log("farm_tick")

		//this will be one of the more complex functions in the whole thing
		//by location, figure out which plants are affected by which structures and which boons
		// tabulate a boon effect list per plant, 
		//	use this to figure out how to apply the climate effects to each plant. 
		//do so.
	}
	
	place_flower(type, location) {
		p = flower_factory(type,location)
		this.plants.push(p)
	}

	place_structure(type,location) {
		s = structure_factory()
		this.structures.push(s)
	}
}




class Climate {
	constructor(){
		this.Rad = 1 //[0,100] scales up slowly
		this.Temp = 50 //[0,100] oscilates 'randomly'
		this.Wind = 0 //[-100,100] occasional discontinuous changes, smooth intraday changes
		this.Light = 50 //[0,100] cloud cover. varies indirectly with temp, more slowly. 
	}
	tick(time){
		//change stuff i ges

	}
}

class Plant{
	constructor(family, type){
		this.family = family
		this.type = type
		this.age = 0
		this.heath = 100,
		this.thirst = 0,
		this.size = 1,
		this.location = 0,
		this.boons = []
	}

}




class Structure{
	constructor(type){
		this.type = type
		this.health =100
		this.location = 0
	}
}



document.onload(function(){
	console.log("hiiii")
	world = Object.create(world_proto)
	world.tick()
})