
function uuidv4() {
  return 'xxxxxxxx-xxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


class World{
	constructor(){
		this.time = 0
		this.user ="default" //set at game creation.  
		this.farm = new Farm()
		this.climate = new Climate()
	}

	tick(){
		//console.log("=======================")
		this.time++
		//update the climate
		this.climate.tick(this.time)
		//apply the climate to the farm
		this.farm.tick(this.time,this.climate.conditions())
		this.render()
	}

	render(){
		//The climate will need to be updated 
		//the plants will need to be drawn or redrawn
		this.farm.render()
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
	
	tick(time, conditions) {
		console.log(conditions)
		_.map(this.plants,function(p){
			p.tick(conditions)
			//console.log(p.status())
		})

		//this will be one of the more complex functions in the whole thing
		//by location, figure out which plants are affected by which structures and which boons
		// tabulate a boon effect list per plant, 
		//	use this to figure out how to apply the climate effects to each plant. 
		//do so.
	}
	
	place_flower(taxon, location) {
		this.plants.push(new Plant(taxon, location))
	}

	place_structure(type,location) {
		this.structures.push(new Structure(type, location))
	}

	render(){
		_.map(this.plants, function(p){
			var state = p.render()
			if(state.changed){
				$(`#${state.id}`).remove()
				$(".farm").append(state.div)
			}
			//if not changed, do nothing.
		})
	}
}


class Climate {
	constructor(){
		this.Rad = 1 
		this.Rad_L = 100.0 //max val
		this.Rad_x0 = 0 // starts at 0
		this.Rad_k = .01 //rate of change

		this.Temp = 50 //
		this.Temp_mag = 50
		this.Temp_freq = .0001

		this.Wind = 0 //[-100,100] occasional discontinuous changes, smooth intraday changes
		this.Wind_mag = 100
		this.Wind_freq = .0000000001

		this.Light = 50 //[0,100] cloud cover. varies indirectly with temp, more slowly. 
		this.Light_mag = 50
		this.Light_freq = .0000001
	}
	tick(time){
		//logistic growth
		this.Rad = this.Rad_L/(1+Math.exp(-this.Rad_k*((time-1000)-this.Rad_x0)))
		//just simple sine waves for now
		this.Temp += this.Temp_mag*Math.sin(this.Temp_freq*time)
		this.Wind += this.Wind_mag*Math.sin(this.Wind_freq*time)
		this.Light += this.Light_mag*Math.sin(this.Light_freq*time)

	}
	conditions(){
		return {
			Rad:this.Rad,
			Temp:this.Temp,
			Wind:this.Wind,
			Light:this.Light
		}
	}
}

//it would be nice if this were stored somewhere else. 
var plant_profiles = {
	"F":{
		"a":{
			name:"Pothos Pothos",
			comfort_zone:{
				Rad:[0,10],
				Temp:[40,80],
				Wind:[-40,40],
				Light:[50,100]
			},
			growth_rate:10,
			thirst_zone:50
		},
		"b":{
			name:"Monstura",
			comfort_zone:{
				Rad:[0,40],
				Temp:[30,50],
				Wind:[-10,10],
				Light:[80,100]
			},
			growth_rate:10,
			thirst_zone:80
		},
		"c":{
			name:"Airplant",
			comfort_zone:{
				Rad:[0,80],
				Temp:[30,50],
				Wind:[-100,100],
				Light:[40,100]
			},
			growth_rate:10,
			thirst_zone:30
		}
	}
}

var family_names = {
	"F":"Flower",
	"V":"Vegetable",
	"T":"Tree"
}

class Plant{
	constructor(taxon, location){
		this.id = uuidv4()
		this.taxon = taxon.split(".") // F=flower V=vegetable T=tree
		this.family = family_names[this.taxon[0]] 
	
		var profile = plant_profiles[this.taxon[0]][this.taxon[1]]
		this.name = profile.name
		this.comfort_zone = profile.comfort_zone
		this.growth_rate = profile.growth_rate
		this.thirst_zone = profile.thirst_zone

		this.location = location

		this.age = 0
		this.health = 100
		this.thirst = 0
		this.stage_of_life = 1

		this.changed = true //while true, it will rerender the object 
	}

	tick(climate_effects){
		this.changed = false
		if(this.health>0){
			this.age +=1	
			// -1 health point for every climate var out-of-range
			//this kid dreams of lisp
			if((climate_effects.Rad>this.comfort_zone.Rad[0]) && (climate_effects.Rad<this.comfort_zone.Rad[1])){
				this.health -= 1
				this.changed = true
			}
			if((climate_effects.Temp>this.comfort_zone.Temp[0]) && (climate_effects.Temp<this.comfort_zone.Temp[1])){
				this.health -= 1
				this.thirst += 1
				this.changed = true
			}
			if((climate_effects.Wind>this.comfort_zone.Wind[0]) && (climate_effects.Wind<this.comfort_zone.Wind[1])){
				this.health -= 1
				this.changed = true
			}
			if((climate_effects.Light>this.comfort_zone.Light[0]) && (climate_effects.Wind<this.comfort_zone.Wind[1])){
				this.health -= 1
				this.changed = true
			}
			if(this.thirst < this.thirst_zone){
				this.heath -= 1
				this.changed = true
			}

			this.thirst += 1  

			if(this.health<=0){
				this.health = 0
			}   
			if(this.thirst>=100){
				this.thirst = 100
			} 	
		}
	}

	status(){
		return `plant: ${this.name}, health: ${this.health}, thirst: ${this.thirst}, age:${this.age}`
	}

	render(){
		//ideally we would have some art here
		if(this.health>0){
			var div =  `
				<div class="plant ${this.taxon.join(".")}" id="${this.id}" 
						style="left:${this.location} ; height:${this.health}"> 
						${this.name[0]}
				</div>`
		}else{
			var div =  `
				<div class="plant ${this.taxon.join(".")} dead" id="${this.id}" 
						style="left:${this.location}"> 
						${this.name[0]}
				</div>`
		}

		
		return {changed:this.changed, id:this.id, div:div}
	}

}


class Structure{
	constructor(type){
		this.type = type
		this.health =100
		this.location = 0
	}
}


class UiHelper{
	constructor(){
		this.tool = ""
	}
}


var world = new World()
var ui_state = new UiHelper()




$(document).ready( function(){
	//console.log("hiiii")

	world.farm.place_flower("F.a", 40)
	world.farm.place_flower("F.b", 100)
	world.farm.place_flower("F.c", 500)

	setInterval(() => world.tick(),1000)
	
	$(".world").on('click', '.farm', function(ev){
		world.farm.place_flower("F.a", ev.pageX)
	})	

})

