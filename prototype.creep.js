Creep.prototype.dropEnergyAtSpawnId = function(id) {
    var spawn = Game.getObjectById(id);
    if(!spawn)return false;
    if(spawn.energyCapacity != spawn.energy){
        if(this.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(spawn);
        }
    }
    return true;
};

Creep.prototype.dropEnergyAtControllerId = function(id) {
    var controll = Game.getObjectById(id);
    if(!controll)return false;
    if(this.transfer(controll, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(controll);
    }
    return true;
};

Creep.prototype.dropEnergyAtStructureId = function(id) {
    var struc = Game.getObjectById(id);
    if(!struc)return false;
    if(struc.structureType === STRUCTURE_STORAGE || struc.structureType === STRUCTURE_CONTAINER){
        if(_.sum(struc.store) === struc.storeCapacity)return false;
    }
    if(struc.structureType === STRUCTURE_TOWER || struc.structureType === STRUCTURE_SPAWN){
        if(struc.energy === struc.energyCapacity)return false;
    }
    
    if(this.transfer(struc, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.moveTo(struc);
    }
    return true;
};

Creep.prototype.dropEnergyAtContainerId = function(id) {
    var miningContainer = Game.getObjectById(id);
    if(miningContainer !== null){
        if(this.transfer(miningContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(miningContainer);
        }
    }else return false;
    return true;
};

Creep.prototype.getEnergyFromContainerId = function(id) {
    var miningContainer = Game.getObjectById(id);
    if(miningContainer !== null){
        if(miningContainer.transfer(this, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(miningContainer);
        }
    }else return false;
    return true;
};

Creep.prototype.getEnergyFromContainersCollection = function(idCollection) {
    for(var id in idCollection){
        var container = Game.getObjectById(idCollection[id]);
        if(_.sum(container.store) > this.carryCapacity){
            this.getEnergyFromContainerId(idCollection[id]);
            return true;
        }
    }
    return false;
};
Creep.prototype.dropEnergyToContainersCollection = function(idCollection) {
    for(var id in idCollection){
        var container = Game.getObjectById(idCollection[id]);
        if(_.sum(container.store) !== container.storeCapacity){
            this.dropEnergyAtContainerId(idCollection[id]);
            return true;
        }
    }
    return false;
};

Creep.prototype.harvestAtId = function(id) {
    var source = Game.getObjectById(id);
    if(!source)return false;
    if(this.harvest(source) == ERR_NOT_IN_RANGE) {
        this.moveTo(source);
    }
    return true;
};

Creep.prototype.dropEnergyAtExtensions = function() {
    var extensions = Game.spawns.Home.room.find(FIND_STRUCTURES, {
        filter: (structure) => {return (structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;}
        });
    
    if(this.transfer(extensions[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(extensions[0]);
    }
    if(extensions.length === 0){
        return false;
    }else return true;
};

Creep.prototype.goAndFindToRepair = function() {
    const WALL_AND_RAMPART_HP = 100000;
    var targets = this.room.find(FIND_STRUCTURES, {
        filter: function(object){
            return object.hits < object.hitsMax && object.structureType !== STRUCTURE_RAMPART && object.structureType !== STRUCTURE_WALL;
        } 
    });
    if(targets.length === 0)targets = this.room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax && object.hits < WALL_AND_RAMPART_HP
    });
    targets.sort((a,b) => (a.hits - b.hits));//(a.hits - a.hitsMax) - (b.hits - b.hitsMax));
    if(targets.length > 0) {
        if(this.repair(targets[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);  
            return true;
        }
    }else return false;
    
};

Creep.prototype.goAndFindToBuild = function() {
    var targets = this.room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length > 0){
        if(this.build(targets[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
            return true;
        }
    }else return false;
};

Creep.prototype.goAndFindWallsToBuild = function() {

    var targets = this.room.find(FIND_STRUCTURES, {
        //filter: { structureType: STRUCTURE_WALL }
        filter: (structure) => {return (structure.structureType == STRUCTURE_WALL) && structure.hits < 100000;}
    });
    if(targets.length > 0){
        if(this.repair(targets[0]) == ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
            return true;
        }
    }else return false;
};

Creep.prototype.setupDoHarvestMemory = function(){
    if(Memory.creeps[this.name] === undefined){
        console.log("mem failed " +creep.name);
    }
    if(Memory.creeps[this.name].doHarvest === undefined)
        Memory.creeps[this.name].doHarvest = true;
        
    if(this.carry.energy === 0){
        Memory.creeps[this.name].doHarvest = true;
    }else Memory.creeps[this.name].doHarvest = false;
};

Creep.prototype.sourceCollection = function(idCollection) 
{
    for(var id in idCollection)
    {
        var source = Game.getObjectById(idCollection[id]);
        if(source.energy !== 0)
        {
            this.harvestAtId(idCollection[id]);
            return true;
        }
    }
    return false;
};

Creep.prototype.healCreep = function()
{
    var target = this.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: function(object) {
            return object.hits < object.hitsMax;
        }
    });
    if(target) {
        if(this.heal(target) == ERR_NOT_IN_RANGE) {
            this.moveTo(target);
            this.say('You will be okay!');
        }
    }
}








