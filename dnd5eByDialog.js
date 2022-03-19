
class dnd5eByDialog {

static actorMenuOnControl = true;
  
static async actorMenu(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  if (!game.user.data.flags.world?.ActorMenuAutoClose)
  await game.user.setFlag('world', 'ActorMenuAutoClose');
let {actorUuid} = args[0] || {};
let t = '';
if (!token) token = _token;
if (!token) actor = game.user.character;
else actor = token.actor;
if (!actor) return ui.notifications.error("No Actor");
token = null;
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
}
t = actor.uuid.replaceAll('.','_');

let w_id = `menu-${t}`;
let position =  { width: '100%',  left: 125, top: 75, id: w_id};


//if($(`#menu-${t}`).length) return ui.windows[$(`#menu-${t}`).attr('data-appid')].close();
$('.actor-menu').hide();
let types = [];

for (let [type, array] of Object.entries(actor.itemTypes) ) {
  if (type==='backpack') continue;
  if (type==='class') continue;
  if (array.length>0)
    types.push(type.capitalize());
}
let length = types.length + 6;
if (types.includes('Spells')) length ++;
console.log(types, length)
let content = `
<div style="margin: 0 3px; position: absolute; right:60px; top: 7px;">
  <input type="checkbox" id="${t}-closeOnMouseLeave" style="float:right; margin-top: 3px;  height: 12px;">
  <label for="${t}-closeOnMouseLeave">Auto-Close</label>
</div>`;
//<div id="${t}-menu-div" style="font-size: 1.1em; font-weight: semibold; display:grid; grid-template-${display}s: repeat(${length}, auto) 10px; grid-${display}-gap: .6em;">`;
let list = [];
for (let type of types){
  list.push( 
  `<a id="open-category-${type}-${t}" name="${type.toLowerCase()}" data-t="${t}" class="type-link">
    <span style="margin: 0 3px" >
      ${type==='Feat'?'Features':((['Equipment', 'Loot'].includes(type))?type:type+'s')} 
    </span>
  </a>`);
  if (type==='Spell') list.push(`
  <a onclick="dnd5eByDialog.spellPreparation('${t}');">
    <span style="margin: 0 3px" >Prepare</span>
  </a>`);
}


list.push(`<a style="" class="menu-roll-dialog-button-${t}" name="${t}-abilities-test">
  <span style=" margin: 0 3px" >Abilities</span>
</a>`);
list.push(`<a style="" class="menu-roll-dialog-button-${t}" name="${t}-abilities-save">
  <span style=" margin: 0 3px" >Saves</span>
</a>`);
list.push(`<a style="" class="menu-roll-dialog-button-${t}" name="${t}-skills-check">
  <span style="margin: 0 3px" >Skills</span>
</a>`);
list.push(`<a id="rest-dialog-${t}" data-t="${t}">
  <span style="margin: 0 3px">Rest</span>
</a>`);
list.push(`<a id="initiative-${t}"  data-t="${t}">
  <span style="margin: 0 3px">Initiative</span>
</a>`);
list.push(`<a id="${t}-ce" data-t="${t}" >
  <span style="margin: 0 10px 0 3px" >Effects</span>
</a>`);

content += '<span style="white-space: nowrap;">'+list.join('')  + '</span>';
Dialog.persist({
  title: `${actor.name}`,
  content,
  buttons: {},
  render: ()=>{
    /*
    $(`#menu-${t}`).click(async function(e){
        console.log(t);
        let placeables = canvas.tokens.placeables.filter(tp => tp?.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
      });
    */
    $(`#${t}-menu-div`).parent().parent().css('padding','3px');
    if (actor.data.data.attributes.hp.value === 0 && actor.type===character) {
      $(`#${t}-menu-div`).empty();
      $(`#${t}-menu-div`).append(`
      <a id="death-save-${t}" data-t="${t}">Death Save</a>
      <i class="fas fa-skull df1 df2 df3"></i>
      <i class="fas fa-skull df2 df3"></i>
      <i class="fas fa-skull df3"></i>
      <i class="fas fa-check ds1 ds2 ds3"></i>
      <i class="fas fa-check ds2 ds3"></i>
      <i class="fas fa-check ds3"></i>
      `);
      //$(`#${t}-menu-div`).parent().prepend(`<style id="${t}-death-style"> 
      //  .df${actor.data.data.attributes.death.failure} {color: red !important; } 
      //  .ds${actor.data.data.attributes.death.success} {color: brightgreen !important; }
      //  </style>`);
      
      console.log($(`.fa-skull.df${actor.data.data.attributes.death.failure}`))
      $(`#${t}-menu-div > .fa-skull.df${actor.data.data.attributes.death.failure}`).css('color', 'red');
      $(`#${t}-menu-div > .fa-check.ds${actor.data.data.attributes.death.success}`).css('color', 'green');
      $(`#death-save-${t}`).click(async function() {
        await actor.rollDeathSave();
        Hooks.once('diceSoNiceRollComplete', () => {
          dnd5eByDialog.actorMenu($(this).attr('data-t').replaceAll('_','.'));
        });
      });
      
    }
    
    $('.type-link').click(function (e) {
      let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
      dnd5eByDialog.characterDialog({
        actorUuid: $(this).attr('data-t').replaceAll('_','.'),
        type: $(this).attr('name'),
        position: {left : e.clientX- 15 , top: e.clientY+15 },
        closeOnMouseLeave
        });
    });
    
    $(`#${t}-ce`).click(function (e) {
      let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
       dnd5eByDialog.actorEffectsList({
         actorUuid: $(this).attr('data-t').replaceAll('_','.'),
         position: {left : e.clientX- 15 , top: e.clientY+15 }, 
         closeOnMouseLeave});
    });
    
    $(`#initiative-${t}`).click(async function (e) {
      let uuidParts = $(this).attr('data-t').replaceAll('_','.').split('.');
      let token;
      if (uuidParts[2]==='Token') token = canvas.tokens.get(uuidParts[3]);
      else  token = canvas.tokens.placeables.find(t=>t.actor?.id===uuidParts[1]);
      if (!game.combats.viewed.turns.map(c=>c.token.id).includes(token.id)) await token.toggleCombat();
      //else  return ui.notifications.warn(`${token.name} already rolled initiative`);
      if (game.user.isGM)
        game.settings.set("core", "rollMode", 'selfroll');
      
      if (!game.combats.viewed.turns.find(c=>c.token.id===token.id)?.initiative) await token.actor.rollInitiative();
    });
    
    $(`#rest-dialog-${t}`).click(function (e) {
      let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
      dnd5eByDialog.restDialog({
        actorUuid: $(this).attr('data-t').replaceAll('_','.'),
        position: {left : e.clientX- 15 , top: e.clientY+15 },
        closeOnMouseLeave});
    });
    
    $(`.menu-roll-dialog-button-${t}`).each(function() {
        $(this).click(async function(e){
          let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
          let vars = this.name.split('-');
          dnd5eByDialog.rollDialog({
            actorUuid: vars[0].replaceAll('_','.'),
            rollType: vars[1],
            abilType: vars[2], 
            position: {left: e.clientX - 15, top: e.clientY + 15}, 
            closeOnMouseLeave});
        });
    });
     
    $(`#${t}-closeOnMouseLeave`).prop('checked', game.user.data.flags.world.ActorMenuAutoClose);

    $(`#${t}-closeOnMouseLeave`).change(async function() {
        await game.user.setFlag('world', 'ActorMenuAutoClose', $(this).is(":checked"));       
    });
    
    $(`#menu-${t}`).find(`section.window-content`).click(async function(e){
        
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
        
        for ( let w of Object.values(ui.windows).filter(w=> w.id !== `menu-${t}` && w.id.includes(`${t}`)))
          ui.windows[w.appId].bringToTop();
      });
    $(`#menu-${t}`).addClass('actor-menu');
    $(`#menu-${t}`).show();
  },
  close:   html => {
    for ( let w of Object.values(ui.windows).filter(w=> w.id !== `menu-${t}` && w.id.includes(`${t}`)))
          ui.windows[w.appId].close();
      return;}
},position
);//.render(true);
  
  return true;
}
  
  
static async characterDialog(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  let {actorUuid, type, position, closeOnMouseLeave} = args[0] || {};
console.log(args[0], actorUuid, type, position, closeOnMouseLeave)
let sortByActionType = false;
//let closeOnMouseLeave = args[3];
let closeTimeout = 1000;
console.log('closeOnMouseLeave', closeOnMouseLeave);
let t = '';
if (!token) token = _token;
if (!token && !actor) actor = game.user.character;
else actor = token?.actor;
if (!actor) return ui.notifications.error("No Actor");
token = null;
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
}
/*
{
  let uuidParts = actorUuid.split('.');
  console.log(uuidParts);
  if (uuidParts[2]==='Token') actor = canvas.tokens.get(uuidParts[3]).actor;
  else  actor = game.actors.get(uuidParts[1]);
  actor = canvas.tokens.placeables.find(t=>t.actor?.uuid===actorUuid).actor;
}*/
t = actor.uuid.replaceAll('.','_');

console.log('t: ', t);
let top = 3;
//let left = window.innerWidth-610;
if (game.user.isGM) top = 80;
let left = 110;
let height = '100%';//window.innerheight-50;
let width = 300;
let w_id = `items-dialog-${t}`;
if (type) w_id += `-${type}`;
let positionDefault = //Object.values(ui.windows).find(w=> w.id===`items-dialog-${t}`)?.position || 
  { height: height, width: width ,  top: top, left: left , id: w_id};
//position["id"] = w_id;
position = {...positionDefault, ...position};

let combatPopout = Object.values(ui.windows).find(w=> w.id === `combat-popout`);
if (combatPopout && !actorUuid) {
  position.top = combatPopout.position.top;
  position.left = combatPopout.position.left + 305;
}

//if (!game.user.isGM) ui.nav._element.hide();

if (!Hooks._hooks.preCreateChatMessage || Hooks._hooks.preCreateChatMessage?.findIndex(f=>f.toString().includes('chatmessagetargetflags'))==-1)
  Hooks.on(`preCreateChatMessage`, async (message, data, options, user) => {
    //chatmessagetargetflags
    if (message.data.flavor?.toUpperCase().includes('ATTACK') || message.data.flavor?.toUpperCase().includes('CAST'))
      message.data.update({"flags.world.targetIds": [...game.user.targets].map(t=>t.id)});
    
    if (message.data.flavor?.toUpperCase().includes('DAMAGE'))
      message.data.update({"flags.world.damageType": message.data.flavor.split(' ')[message.data.flavor.split(' ').indexOf('Damage')-1]});
    
    if (message.data.flavor?.toUpperCase().includes('HEALING')) {
      message.data.update({"flags.world.targetIds": [...game.user.targets].map(t=>t.id)});
      message.data.update({"flags.world.damageType": 'Healing'});
    }
    
    if (message.data.flavor?.toUpperCase().includes('ROLLING SAVES'))
      message.data.update({"flags.world.targetIds": [...game.user.targets].map(t=>t.id)});
    
  });

function itemFilter(i){
  if( actor.data.type !== 'character' )
    return true;
  if( !i.data.type )
    return false;
  if( i.data.type === undefined )
    return false;
  if( !i.data.data.activation )
    return false;
  if( i.data.data.activation.type === '' || 
    i.data.data.activation.type === undefined || 
    i.data.data.activation.type === 'none' ){
    return false;
  }
  if( i.data.type === "weapon"){
    if( i.data.data.equipped )
      return true;
    return true; //Unequipped Items
  }
  if( i.data.type === "spell"){
    if( i.data.data.preparation ){
      if( i.data.data.preparation.prepared )
        return true;
      if( i.labels.level === "Cantrip")
        return true;
    }
    return false ;
  }
  if( i.data.type === "consumable" ){
    if( i.data.data.consumableType !== "ammo")
      return true;
    return false;
  }
  
  if( i.data.type === "loot" ) return true;
  if( i.data.type === "feat" )
    return true;
  if( i.data.type === "equipment" )
    return true;

  return false ;
}

let spells = {};
if (actor.data?.data?.spells) {
  let spells = JSON.parse(JSON.stringify(actor.data.data.spells));
  for (const [key, value] of Object.entries(spells)){
    if (value.max > 0) {
      for (let level = parseInt(key.substr(-1)); level > 0; level--) {
        if ('spell'+level === key ){
          spells['spell'+level].slotsAvailable = false;
        }
        if (value.value > 0)
          spells['spell'+level].slotsAvailable = true;
      }
    }
  }
  await actor.update({'data.spells': spells});
}

$(`div[id*=${t}]`).show();

let otherActions = false;
//if($(`[id^=item-rolls-dialog-${t}]`).length) 
//  $(`[id^=item-rolls-dialog-${t}]`).each(function(){ui.windows[$(this).attr('data-appid')].close()});

let unavailable = 'rgba(120,120,120,0.5) !important';

//if (canvas.tokens.controlled.length !== 1) return ui.notifications.warn("Please Select One Token");
let content=`
<style>
.ith {
  border-bottom: 1px solid #555; 
  margin-top: 2px;
  width: 90%;
}
.ilh {
  border-bottom: 1px solid #555; 
  margin-top: 2px;
  width: 80%;
}/*url('../icons/svg/d20-grey.svg')*/
.item-img:hover { cursor: pointer ; box-shadow: 0 0 8px red; }
.item-img{vertical-align:middle;margin-bottom:1px;border:1px solid #444}
</style>`;

let header = `${actor.data.name}`;
console.log(type)
if (type) header = `${actor.data.name} - ${(type==='feat'?'Features':((['equipment', 'loot'].includes(type))?type:type+'s')).capitalize()}`;
//<a style="float:left;margin-left:0;" onclick="game.actors.get('${actor.id}').sheet.render(true)" title="Sheet"><img src="${actor.data.token.img}" height="20" style="border:unset;vertical-align:middle;"/></a>
if (!actorUuid)
content+=`
<div style="display: grid; grid-template-columns: repeat(5,auto); border-bottom:0px solid black;border-top:0px solid black;margin-bottom:.5em">
<div style="font-size:1.1em"><a style="" class="roll-dialog-button-${t}" name="${t}-abilities-test">Abilities</a></div>
<div style="font-size:1.1em;"><a style="" class="roll-dialog-button-${t}" name="${t}-abilities-save">Saves</a></div>
<div style="font-size:1.1em;"><a style="" class="roll-dialog-button-${t}" name="${t}-skills-check">Skills</a> </div>
<div style="font-size:1.1em;"><a style="margin-right:5px" onclick="_token.toggleCombat(game.combats.active);"><i class="fas fa-fist-raised"></i></a><a  onclick="_token.actor.rollInitiative()">Initiative</a></div>
<div style="font-size:1.1em;"><a onclick="dnd5eByDialog.actorEffectsList('${t}');"><i class="fas fa-bolt"></i></a></div>
</div>`;

let doNotFilter = ["feat", "tool", "loot", "equipment"];

let actorItems;
if (type) {
  if (doNotFilter.includes(type)) actorItems = actor.itemTypes[type]
  else  actorItems = actor.itemTypes[type].filter(x => itemFilter(x));;
}
else actorItems = actor.items.filter(x => itemFilter(x));

let items = {};//.filter(x => itemFilter(x))
for (const x of actorItems) {
    
  let available = true;
  if (x.data.data.uses?.value === 0 && x.data.data.uses?.max !== 0 ) available = false;
  //if ( x.type === 'spell') console.log(x.data.name, x.data.data.level, actor.data.data.spells['spell'+x.data.data.level]?.slotsAvailable);
  //console.log(actor.data.data.spells);
  if ( x.type === 'spell' &&  !actor.data.data.spells['spell'+x.data.data.level]?.slotsAvailable) available = false;
  if ( x.data.data.consume?.type === "charges") if (actor.items.get(x.data.data.consume?.target).data.data.uses.value === 0) available = false;
  if (x.data.data.quantity===0) available = false;
  
  if (x.data.data.uses?.value !== 0 && x.data.data.uses?.max > 0 ) available = true;
  if( x.data.type === "spell"){
    if( x.data.data.preparation ){
      if(! x.data.data.preparation.prepared )
        available = false ;
    }
  }
  if (x.type === 'spell' && x.data.data.level === 0) available = true;
  let title = '';
  if (x.type === 'spell'){
    title +=  `${x.labels.level}\n`;
    title +=  `${x.labels.school}\n`;
    if (x.labels.components.length)  title += x.labels.components.join(', ');
    if (x.labels.components.includes('M')) title += `\n${x.labels.materials}`;
    if (x.labels.range) title += '\nRange: ' + x.labels.range;
    if (x.labels.target) title += '\nTarget: ' + x.labels.target;
  }
  let ammoSelect = '';
  if ( x.data.data.consume?.type === "ammo" && x.data.data.consume?.target !== x.id){
    let ammo = actor.items.filter(i => i.data.data.consumableType === x.data.data.consume?.type);
    if (ammo) {
      ammoSelect = `<select id="${x.id}-ammo" name="${x.id}" class="ammo-select" style="display:inline;height:18px;margin-left: 20px; vertical-align:bottom;"><option value="" ></option> ` ;
      let ammoItem = actor.items.get(x.data.data.consume.target);
      for (let a of ammo) {
        ammoSelect += `<option id="${a.id}-option" value="${a.id}" ${x.data.data.consume.target===a.id?' selected ':''}>${a.data.name} ${a.data.data.quantity>1?'('+a.data.data.quantity+')':''}</option>`;
      }
      ammoSelect += `<select>`;
    }
  }
  
  let equipped = ``;
  /*
  if (x.data.data.equipped)
    equipped = ` <i class="fas fa-user-alt" style="font-size:10px"></i> `;
    */
  let text = `<div id="${x.id}" > <img  src="${x.img}"  class="item-img" height="20" name="${x.id}" title="Roll"><span style="vertical-align:bottom;"> 
        <a id="roll-${x.id}" name="${x.id}" title="${title}" 
        class=" ${(x.type === 'spell' && x.data.data.level !== 0 && !(x.data.data.uses?.max !== undefined  && x.data.data.uses?.max !== 0 && x.data.data.uses?.max !== '' && x.data.data.uses?.max !== null))?t+'-spell'+x.data.data.level:''}" 
        style="${x.data.data.equipped?'text-decoration:underline;':''} ${available?'':'color: '+ unavailable}">${x.data.name} ${x.data.data.quantity>1?'('+x.data.data.quantity+')':''} 
      ${x.data.data.uses?.max && x.data.data.uses?.max !== 0 && x.data.data.uses?.max !== '' && x.data.data.uses?.max !== null ? '('+ x.data.data.uses?.value +'/'+x.data.data.uses?.max+')':''} </span></a>${equipped}${ammoSelect}</div> `;
    

  let level = "none";
  if (x.labels.level)
    level = 'Level ' + x.data.data.level;
    if (x.data.data.level === 0)
      level = 'Cantrip';
    if (x.data.data.preparation?.mode === 'innate')
      level = 'Innate';//level = 'Innate';
    if (x.data.data.preparation?.mode === 'pact')
      level = 'Pact Magic';
  let itemType = x.type;
  
  //if (x.type === 'spell' && x.data.data?.preparation?.mode === 'innate') itemType = 'feat';
  let activation = x.labels.activation
  if (!sortByActionType) activation = 'All'
  
  
  if (!items[itemType])
    items[itemType] = {};
  if (!items[itemType][activation])
    items[itemType][activation] = {};
  if (!items[itemType][activation][level])
    items[itemType][activation][level] = {};
  if (!items[itemType][activation][level][x.data.name])
    items[itemType][activation][level][x.data.name] = [];
    items[itemType][activation][level][x.data.name].push(text);
  
}
let sections = '';//'<div style="width: 298px; height: 658px; overflow: scroll;">';
for (const key of Object.keys(items).sort().reverse()) {
  let h = key.capitalize();
  if (h === 'Feat') h = 'Feature';
  if (h !== 'Equipment') h = h+'s';
  if (!actorUuid) sections += `<h2 class="iah">${h}</h2>`;
  sections += `<div  style="" class="section" id="act-${key.capitalize()}"> `;
  for (const activation of Object.keys(items[key]).sort()) {
  if (sortByActionType)
    sections += `<h3 class="ith" style="">${activation.capitalize().replace('1 ', '')}</h3><div style="margin-bottom:.5em">`;
  
  for (const level of Object.keys(items[key][activation]).sort()) {
    
    if (level !== 'none')
      sections += `<h4 class="ilh" style="">${level}</h4><div style="margin-bottom:.5em">`;
    for (const name of Object.keys(items[key][activation][level]).sort()){
      for (const item of Object.values(items[key][activation][level][name]).sort()){
        sections += item; 
      }
    }
    if (level !== 'none')
      sections += `</div>`;
  }
  sections += `</div>`;  
  }
  sections += `</div>`;
}
content += sections ;

//content =  TextEditor.enrichHTML(content);
//-------------------------------------------------------------
let folder = game.folders.getName('Actions')?.id;
if (folder && otherActions && actor.data.type === 'character'){
   content += `<h2 class="iah">Other Actions</h2><div>`;

   for (const x of game.items.filter(item => item.data.folder === folder)) {
  content += `<div> <img  src="${x.img}"  class="item-img" height="20" name="${x.id}" title="Roll"><span> <a id="roll-${x.id}" name="${x.id}">
  ${x.data.name}</a></span></div>`;
  } 
  content += `</div>  `;
}
content += '</div>';

//----------------other-----------------//

let other = [];
//for ( let x of actor.items.filter(i=> i.type !== 'feat' && i.type !== 'class' && ( i.data.data.activation?.type === '' || i.data.data.activation?.type === undefined ||  i.data.data.activation?.type === 'none')))
if (!actorUuid) {
  for (let x of actor.items.filter(i => !itemFilter(i) && i.type !== 'feat' && i.type !== 'spell' && i.type !== 'class' )) {
    other.push(`<a id="roll-${x.id}" name="${x.id}">${x.name}${x.data.data.quantity>1?' ('+x.data.data.quantity+')':''} </a>`);
  }
  if (other.length > 0)
    content += `<h2 class="iah">Other Equipment</h2><div style="margin-bottom:.5em">` + other.join(', ') + `</div>`;
}
//----------------currency-----------------//
if (actor.data.type === 'character' && !actorUuid) {
  content += `<h2>Currency</h2><div style="display: grid; grid-template-columns:repeat(${Object.keys(actor.data.data.currency).length}, 1fr);">`
  for (let [key, value] of Object.entries(actor.data.data.currency))
    content += `<div>
      ${key}: <a id="${actor.id}-${key}" name="${actor.id}" class="editable-span" text="${value}">${value}</a>
    </div>`
  content += `</div>`;
}
//-------------------------------------------------------------
//let d = new 
Dialog.persist({
  title: header,
  content:  content,
  buttons: {},
  render: (app) => {
    
      if (closeOnMouseLeave) {
        //$(`#${w_id}`).mouseleave(async function(e){
        //  Object.values(ui.windows).find(w=> w.id===w_id).close();
        //});
        $(`#${w_id}`).mouseenter(function(e){
          $(`#${w_id}`).removeClass('hide');
        });
        
        $(`#${w_id}`).mouseleave(async function(e){
          $(`#${w_id}`).addClass('hide');
          await new Promise((r) => setTimeout(r, closeTimeout));
          if ($(`#${w_id}`).hasClass('hide'))
            Object.values(ui.windows).find(w=> w.id===w_id).close();
        });  
      }
        
      
      $('.iah, .ith, .ilh ').contextmenu(async function(e){
        $(this).next().toggle();
      });
      
      if (!type && $(`#items-dialog-${t} > header`).find('img').length===0) {
        $(`#items-dialog-${t} > header`).prepend(`<a style="margin: 0 0 0 0" id="${t}-header-img" name="${t}"><img src="${actor.data.token.img}" height="23" style="border:unset;vertical-align:middle;margin:0 3px 1px 0;"/></a>`);
        $(`#items-dialog-${t} > header`).attr('style','padding: 0px 8px 0px 3px !important;')
      }
      if (type) $(`#items-dialog-${t}-${type} > header > h4`).html(header);
      
      $(`#${t}-header-img`).click(async function(e){
        dnd5eByDialog.characterDialog();
      });
      
      $(`#${t}-header-img`).contextmenu(async function(e){
        console.log("title click", this.name);
        if (this.name.includes("Token"))
          canvas.tokens.get(this.name.split('_')[3]).actor.sheet.render(true);
        if (this.name.includes("Actor"))
          game.actors.get(this.name.split('_')[1]).sheet.render(true);
      });
      
      $(".editable-span").click(async function(e){
        if (!$(this).attr("text")) $(this).attr("text", $(this).html());
        let text = $(this).attr("text");
        let id = $(this).attr("id");
        $(this).toggle();
        console.log(id, text);
        $(this).before(`<input id="${id}-input" type="number" value="${text}" style="width:${$(this).width()+10}px; height:${$(this).height()}px"></input>`);
        $(`input#${id}-input`).select();
        $(`#${id}-input`).keyup(async function(e){
          if (e.which !== 13) return;
          let value = parseInt($(this).val());
          if (value == undefined || value == null ) {
            $(this).next().toggle();
            $(this).remove();
            ui.notifications.error('invalid currency ammount');
            return;
          }
          let actorid = $(this).next().attr("id").split('-')[0];
          let key = $(this).next().attr("id").split('-')[1];
          await game.actors.get(actorid).update({[`data.currency.${key}`]:value});
          $(this).next().attr("text", value);
          $(this).next().html(value);
          $(this).next().toggle();
          $(this).remove();
          
        });
      });
      
      $(`.roll-dialog-button-${t}`).each(function() {
        $(this).click(async function(e){
          let vars = this.name.split('-');
          dnd5eByDialog.rollDialog({
            actorUuid: vars[0].replaceAll('_','.'),
            rollType: vars[1],
            abilType: vars[2], 
            psoition: {left: e.clientX - 15, top: e.clientY + 15}, 
            closeOnMouseLeave});
          //dnd5eByDialog.rollDialog(vars[0].replaceAll('_','.'),vars[1],vars[2], {left: e.clientX - 15, top: e.clientY + 15}, false);
        });
      });
      
      $(`.ammo-select`).change(async function(){
        await actor.updateEmbeddedDocuments("Item", [{_id: this.name, "data.consume.target": $(`select#${this.name}-ammo`).val()}]);
      });
      
      $("a[id^=roll]").click(async function(e){
        let x = actor.items.get(this.name);
        console.log(x);
        if(!x) x = game.items.get(this.name);
        if($(`#item-rolls-dialog-${x.id}`).length) return $(`#item-rolls-dialog-${x.id}`).remove();
        let text  = `<style>
          .my-inline-roll {
          background: #DDD;
          padding: 1px 4px;
          border: 1px solid #4b4a44;
          border-radius: 2px;
          white-space: nowrap;
          word-break: break-all;
          }
          /*
          .jlnk__entity-link {
	          color: rgba(0, 0, 0, 0.8) !important;
	          background: #DDD !important;
          }
          */
        </style>
        <div class="item-rolls" id="rolls-${x.id}">
        <a id="${x.id}-chat-description" style="float:right; clear:both;" title="${x.data.name} description">&nbsp;<i class="fas fa-comment-alt"></i></a>
        <div id="${x.id}-description"> <img src="${x.data.img}" width="32" style="border:unset; float:left;  margin: 0 5px 0 0;"/> ${x.data?.data?.description?.value}</div>`;
        //ChatMessage.create({ flavor: '${x.data.name}', content: $(this).prev().html()});clear:both;
        //-----------LABELS AND ROLLS---------------//
          if (x.labels.level) text +=  `${x.labels.level} `;
          if (x.labels.school) text +=  `${x.labels.school} `;
          if (x.labels.components?.length)  text += x.labels.components.join(', ');
          if (x.labels.components?.includes('M')) text += `<br>Materials: ${x.labels.materials}`;
          if (x.labels.activation && x.labels.activation !== 'None') text += '<br>Activation: ' + x.labels.activation;
          if (x.labels.range && x.labels.range !== '5 Feet') text += '<br>Range: ' + x.labels.range;
          if (x.labels.target) text += (game.dnd5e.canvas.AbilityTemplate.fromItem(x))?`<br><a id="${x.id}-inline-targeting" name="${x.id}" class="my-inline-roll"><i class="fas fa-bullseye"></i> Template:  ${x.labels.target}</a>`:`<br>Targets:  ${x.labels.target}`;
          if (x.labels.duration && x.labels.duration !== 'Instantaneous') text += '<br>Duration: ' + x.labels.duration;
          if (x.labels.save) text +=`<br><a id="${x.id}-inline-dc" name="${x.id}" class="my-inline-roll"><i class="fas fa-dice-d20"></i> Save ${x.labels.save}</a>`;
          if (x.data.data.recharge?.value) 
            if (!x.data.data.recharge?.charged) 
              text +=`<br><a id="${x.id}-inline-recharge" name="${x.id}" class="my-inline-roll"><i class="fas fa-dice-d6"></i> Recharge</a>`;
            else
              text +=`<br><a id="${x.id}-inline-recharge" name="${x.id}" class="my-inline-roll"><i class="fas fa-dice-d6"></i> Charged</a>`;
          let foundEffects = game.dfreds?.effects?.all.filter(e => x.data.name?.toUpperCase()===e.name.toUpperCase());
          if (foundEffects?.length > 0) 
            text += `<br><a id="${x.id}-effect-button" class="my-inline-roll" name="${foundEffects[0].name}" style="margin-right: .3em"><i class="fas fa-bolt"></i> Apply Effect to Targets</a>`; 
        //-----------ROLLS---------------//
        //let actorName = ``;
        //if (token.data.disposition > 2) actorName = `${actor.name} `;
        text  += `<table>`;
        
        //-----------ATTACK---------------//
        let attackToHit = x.getAttackToHit();
        if (attackToHit){
          //<a class="inline-roll roll" title="Bite Attack" data-mode="roll" data-flavor="Bite Attack" data-formula="1d20 + 4 + 3"><i class="fas fa-dice-d20"></i> 1d20 + 4 + 3</a></td><td align="right">
          console.log(attackToHit);
          text += '<tr><th align="left">Attack</th><td style="color: #000" >[[/r 1d20 + ' + 
            //Roll.parse(attackToHit.parts.reduce((a,t) => a+=" + " + t , ""), attackToHit.rollData).reduce((a,t) => a+=t.formula, "") +
            Roll.getFormula(Roll.parse(attackToHit.parts.join(' + '), attackToHit.rollData)) + 
            ` # ${x.data.name} - Attack]] 
            <a id="${x.id}-inline-adv"  class="my-inline-roll" >ADV</a>
            <a id="${x.id}-inline-d20"  class="my-inline-roll" style="display:none"><i class="fas fa-dice-d20"></i></a>
            <a id="${x.id}-inline-dis"  class="my-inline-roll" >DIS</a>
            </td></tr>` ;
        }
        
        //-----------DAMAGE---------------//
        let damageRolls = [];  
        
        if (x.data.data.damage)
        for (let dp of x.data.data.damage.parts) {
          let damageRoll = new Roll(dp[0], x.getRollData());
          for (let t of damageRoll.terms.filter(t=> t.constructor.name === 'Die' || t.constructor.name === 'MathTerm' ))
            t.options.flavor = dp[1];
          let dr = '<tr><th align="left">' + (dp[1] ? dp[1].capitalize(): '') + 
             `</th><td>[[/r ` + Roll.fromTerms(damageRoll.terms)._formula +  ` # ${x.data.name} - ` +  (dp[1]?dp[1].capitalize():'') + (dp[1] === 'healing'?``:` Damage`)+ `]] `;
          
          if (x.data.data.scaling?.formula)  
            dr += `<a id="${x.id}-inline-scaling"  class="my-inline-roll" name="${x.id}"> + ${x.data.data.scaling?.formula}</a> `;
            /*
          dr += `[[/r ` + Roll.fromTerms(damageRoll.terms.filter(t=> t.constructor.name === 'Die' || t.constructor.name === 'MathTerm'))._formula +  ` # ${x.data.name} - ` +  (dp[1]?dp[1].capitalize():'') + (dp[1] === 'healing'?``:` Damage`)+ `]] `;
            */
          if (attackToHit)  
          dr += `<a id="${x.id}-inline-crit"  class="my-inline-roll">Critical</a>`;
          
          if (dp[1] === 'healing')
            dr += `<a id="${x.id}-inline-max"  class="my-inline-roll">Max</a>`;
            dr+='</td></tr>';
            
          damageRolls.push(dr);
        }
        if (!actor.shield?.data.data.equipped && x.data.data?.damage?.versatile){
          let dt = x.data.data.damage.parts[0][1];
          damageRolls.push(`<tr><th align="left">Versatile</th><td>[[/r ` + 
            Roll.replaceFormulaData(x.data.data.damage.versatile, x.getRollData())  + 
            ` # ${x.data.name} - Versatile ` +  (dt ? dt.capitalize() : '') + ` Damage]] 
            <a id="${x.id}-inline-crit"  class="my-inline-roll" >Critical</a>
            </td></tr>`);
        }
        if (x.data.data.formula)
          damageRolls.push(`<tr><th align="left">Other</th><td>[[/r ${Roll.replaceFormulaData(x.data.data.formula, x.getRollData())} # ${x.data.name} - Other Damage]]
          <a id="${x.id}-inline-crit"  class="my-inline-roll" >Critical</a>
          </td></tr>`);
        
        
        for (let dr of damageRolls){
          text += dr;
        }
          
        text += `</table></div>`;
        //--------------ITEM USES------------------//
        if (x.data.data.uses?.max > 0 ){
          let usesCount = `Uses: <a id="${x.id}-uses-count" class="my-inline-roll" name="${x.id}">${x.data.data.uses?.value}/${x.data.data.uses?.max}</a>`;
          text += usesCount;
        }
        //--------------AMMO USES------------------//
        if ( x.data.data.consume?.type === "ammo"){
          let ammoItem  = actor.items.get(x.data.data.consume.target);
          if (ammoItem) {
            let ammoCount = `${ammoItem?.data.name} Count: <a id="${x.id}-ammo-count" name="${x.data.data.consume.target}" 
            class="my-inline-roll" style="">${ammoItem.data.data.quantity}</a>`;
            text +=  ammoCount;
          }
        }
        //-----------OTHER ITEM USES---------------//
        if ( x.data.data.consume?.type === "charges"){
          let chargeItem = actor.items.get(x.data.data.consume.target);
          //console.log(chargeItem);
          if (chargeItem) {
            let chargeCount = `${chargeItem?.data.name} Uses: <a id="${x.id}-charges-count" name="${x.data.data.consume.target}" 
            class="my-inline-roll" style="">${chargeItem.data.data.uses.value}/${chargeItem.data.data.uses.max}</a>`;
            text +=  chargeCount;
          }
        }
        //--------------Spell SLOTS----------------//
        if (x.type === 'spell' && !(x.data.data.uses?.max > 0 )) {
          let spellTable = `<table>`;
          let spellTableHeaders = `<tr><th align="left">Level</th>`;
          let spellTableColumns = `<tr><th align="left">Slots</th>`;
          if (x.data.data.level === 0){
            spellTableHeaders += `<th style="text-decoration: underline"'>Cantrip</th>`
            spellTableColumns += `<td  style="text-align:center"><a id="${x.id}-spell-level-0" name="0" 
               class="my-inline-roll spell-level-0" data="${x.id}"><i class="fas fa-infinity"></i></a></td>`;
          } else {
          for (const [key, value] of Object.entries(actor.data.data.spells)){
             if (value.max > 0 && x.data.data.level <= parseInt(key.substr(-1))) {
               spellTableHeaders += `<th ${((x.data.data.level === parseInt(key.substr(-1)))?'style="text-decoration: underline"':'style=""')}>${key.substr(-1)}</th>` ;
               spellTableColumns += `<td  style="text-align:center"><a id="${x.id}-spell-level-${key.substr(-1)}" name="${key.substr(-1)}" 
               class="my-inline-roll spell-level-${key.substr(-1)}" style="" data="${x.id}">${value.value}/${value.max}</a></td>`;
             }
          }
          }
          spellTable += spellTableHeaders + `<tr>` + spellTableColumns + `<tr>` + `</table>`;
          text += spellTable;
        }
        
        let d = new Dialog({
              title : `${x.data.name}`, 
              content : TextEditor.enrichHTML(text),
              buttons : {},
              render: (app) => {
                app.find('a').each(async function(){
                  let foundEffects = game.dfreds.effects.all.filter(e => $(this)[0].outerText.trim().toUpperCase() === (e.name.toUpperCase()));
                  if (foundEffects.length > 0) {
                    let $link = $(`<a class=""><i class="fas fa-bolt" style="margin-left:.25em"></i></a>`);
                    $link.click(async ()=>{
                      let effect = this.outerText.trim().split(' ').map(e=>e.capitalize()).join(' ');
                      let targets = [...game.user.targets].map(t=> t.actor.uuid);
                      if (targets.length===0)
                        targets = canvas.tokens.controlled.map(t=> t.actor.uuid);
                      await game.dfreds.effectInterface.toggleEffect(effect, {uuids:targets});
                    });
                    $(this).after($link);
                  }
                });
                let header = `${x.data.name}`;
                
                //if (closeOnMouseLeave)
                //  $(`#item-rolls-dialog-${t}-${x.id}`).mouseleave(async function(e){
                //    Object.values(ui.windows).filter(w=> w.id===`item-rolls-dialog-${t}-${x.id}`)[0].close();
                //  });
                if (closeOnMouseLeave) {
                  $(`#item-rolls-dialog-${t}-${x.id}`).mouseenter(function(e){
                    $(`#item-rolls-dialog-${t}-${x.id}`).removeClass('hide');
                  });
                  
                  $(`#item-rolls-dialog-${t}-${x.id}`).mouseleave(async function(e){
                    $(`#item-rolls-dialog-${t}-${x.id}`).addClass('hide');
                    await new Promise((r) => setTimeout(r, closeTimeout));
                    if ($(`#item-rolls-dialog-${t}-${x.id}`).hasClass('hide'))
                      Object.values(ui.windows).filter(w=> w.id===`item-rolls-dialog-${t}-${x.id}`)[0].close();
                  });  
                }
                  
                  
                console.log(`#item-rolls-dialog-${t}-${x.id} .inline-roll`)
                $(`#item-rolls-dialog-${t}-${x.id} .inline-roll.roll`).contextmenu(async function(e) {
                  let targetElement = $(this);
                  let oldFormula = targetElement.attr('data-formula');
                  let flavor = targetElement.attr('data-flavor');
                  let flavorType = '';
                  if (flavor.toUpperCase().includes('ATTACK')) flavorType = ' + Attack (adv/dis)';
                  if (targetElement.attr('data-flavor').toUpperCase().includes('DAMAGE')) flavorType = ' + Crit Dice';
                  let newRoll = new Roll(oldFormula);
                  let terms = [];
                  for (let t of newRoll.terms.filter(t=> t.constructor.name === 'Die'))
                    terms.push(t)
                  let formula = Roll.fromTerms(terms)._formula;
                  targetElement.attr('data-formula', formula);
                  targetElement.attr('data-flavor', flavor + flavorType);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.click();
                  targetElement.attr('data-formula', oldFormula);
                  targetElement.attr('data-flavor', flavor.replace(flavorType,''));
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${oldFormula}`);
                });
                  
                $(`#item-rolls-dialog-${t}-${x.id} > header > h4`).html(header);
                
                $(`a[id^=${x.id}-header-roll]`).click(async function(e){
                  actor.items.get(`${x.id}`).roll()
                });
                
                $(`a[id^=${x.id}-effect-button]`).click(async function(e){
                  let effect = $(this).attr('name');
                  console.log([...game.user.targets].map(t=>t.actor.uuid));
                  await game.dfreds.effectInterface.toggleEffect(effect, {uuids:[...game.user.targets].map(t=>t.actor.uuid)});
                });
                
                $(`a[id^=${x.id}-chat-description]`).click(async function(e){
                  ChatMessage.create({flavor: `${x.data.name}`, speaker:ChatMessage.getSpeaker({actor: x.parent}),  content:  $(this).next().html()})
                });//flavor: `${x.data.name}`,`@ActorEmbeddedItem[${x.parent.id}][${x.id}]{${x.data.name}}<br>` +
                
                $(`a[id^=${x.id}-inline-targeting]`).click(async function(e){
                  let item = x;// = actor.items.get(this.name);
                  game.dnd5e.canvas.AbilityTemplate.fromItem(item).drawPreview()
                });
                
                $(`a[id^=${x.id}-inline-dc]`).click(async function(e){
                  let item = x;//actor.items.get(this.name);
                  //ui.chat.processMessage(`<h2>${item.data.name}</h2><h3>Save ${x.labels.save}</h3>`);
                  let dcArray = x.labels.save.split(' ');
                  let ability = dcArray[dcArray.length-1];
                  let dc = parseInt(dcArray[dcArray.length-2]);
                  let abil = Object.keys(CONFIG.DND5E.abilities).find(key => CONFIG.DND5E.abilities[key] === ability);
                  ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: x.parent}), flavor: `Rolling Saves for ${x.data.name}...`})
                  for (let target of game.user.targets) {
                    let roll = await new Roll(`1d20 + ${target.actor.data.data.abilities[abil].save}`).roll({ async: true });
                    let result;
                    if (roll.total < dc)
                      result = 'Failed';
                    else
                      result = 'Succeeded';
                      
                    roll.toMessage({speaker:ChatMessage.getSpeaker({actor: x.parent}),flavor:`${target.name}<br><b>${result}</b> ${ability} Save for ${x.name}`,"flags.world.save":{[target.id]:result}},{rollMode: 'blindroll'});
                    //console.log(roll.total)
                  }
                });
                $(`a[id^=${x.id}-inline-recharge]`).click(async function(e){
                  let item = x;// = actor.items.get(this.name);
                  
                  let roll = await new Roll(`1d6`).roll({ async: true });
                  let result ;
                  if (roll.total < item.data.data.recharge.value) {
                    result = 'Failed';
                  }
                  else {
                    result = 'Succeeded';
                    await item.update({'data.recharge.charged':true});
                    $(this).html(`<i class="fas fa-dice-d6"></i> Charged`);
                  }
                  roll.toMessage({flavor:`${item.name} Recharge: ${result}`},{rollMode: 'gmroll'});
                 
                });
                
                $(`a[id^=${x.id}-inline-recharge]`).contextmenu(async function(e){
                  //console.log(this.text);
                  let item = x;// = actor.items.get(this.name);
                  if (this.text.includes('Recharge')) {
                    $(this).html(`<i class="fas fa-dice-d6"></i> Charged`);
                    await item.update({'data.recharge.charged':true});
                  }
                  else {
                    $(this).html(`<i class="fas fa-dice-d6"></i> Recharge`);
                    await item.update({'data.recharge.charged':false});
                  }
                });
                
                $(`a[id^=${x.id}-inline-adv]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  let numD20 = 2;
                  if (e.shiftKey) 
                    numD20 = 3;
                  formulaArray.shift();
                  formulaArray.unshift(numD20+'d20kh');
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.css('box-shadow','0 0 8px inset lawngreen');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' with advantage');
                  targetElement.click();
                  $(this).next().click();
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' with advantage',''));
                });
                
                $(`a[id^=${x.id}-inline-d20]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  let numD20 = parseInt(formulaArray[0].split('d')[0]);
                  formulaArray.shift();
                  formulaArray.unshift('1d20');
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.css('box-shadow','unset');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                });
                
                $(`a[id^=${x.id}-inline-dis]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  formulaArray.shift();
                  formulaArray.unshift('2d20kl');
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.css('box-shadow','0 0 8px inset red');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' with disadvantage');
                  targetElement.click();
                  $(this).prev().click();
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' with disadvantage',''));
                });
                
                $(`a[id^=${x.id}-inline-max]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let oldFormula = targetElement.attr('data-formula');
                  let formula = oldFormula.replaceAll('d','*');
                  targetElement.attr('data-formula', formula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' Max');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.click();
                  targetElement.attr('data-formula', oldFormula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' Max',''));
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${oldFormula}`);
                });
                
                $(`a[id^=${x.id}-inline-crit]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let oldFormula = targetElement.attr('data-formula');
                  let formula = new Roll(oldFormula).alter(2,0)._formula;
                  targetElement.attr('data-formula', formula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' Critical');
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                  targetElement.click();
                  targetElement.attr('data-formula', oldFormula);
                  targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' Critical',''));
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${oldFormula}`);
                });
                $(`a[id^=${x.id}-inline-scaling]`).click(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let item = actor.items.get($(this).attr('name'));
                  let formulaArray = targetElement.attr('data-formula').split(' ');
                  formulaArray.push(' + ' + item.data.data.scaling.formula);
                  let formula = formulaArray.join(' ');
                  targetElement.attr('data-formula', formula);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
                });
                
                $(`a[id^=${x.id}-inline-scaling]`).contextmenu(async function(e){
                  let targetElement = $(this).parent().children(':first-child');
                  let scalingFormula = $(this).text();
                  let formula = targetElement.attr('data-formula');
                  let newFormula = formula.replace(scalingFormula,'');
                  targetElement.attr('data-formula', newFormula);
                  targetElement.html(`<i class="fas fa-dice-d20"></i> ${newFormula}`);
                });
                
                $(`a[id^=${x.id}-uses-count]`).contextmenu(async function(e){
                  let item = actor.items.get(this.name);
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  console.log(uses)
                  if (uses.value < uses.max) {
                    uses.value++;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${x.id}-uses-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${x.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value > 0) {
                    $(`#roll-${x.id}`).css('color', `unset`);
                    let whatUses = actor.items.filter(x => x.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).css('color', `unset`);
                  }
                });
                
                $(`a[id^=${x.id}-uses-count]`).click(async function(e){
                  let item = actor.items.get(this.name);
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  if (uses.value > 0) {
                    uses.value--;
                    if (item.type === 'spell')
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`});
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${x.id}-uses-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${x.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value == 0) {
                    $(`a#roll-${x.id}`).attr('style', `color : ${unavailable}`);
                    let whatUses = actor.items.filter(x => x.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                $(`a[id^=${x.id}-ammo-count]`).contextmenu(async function(e){
                  $(this).off('oncontextmenu');
                  let count = $(`a#${x.id}-ammo-count`).html();
                    count++;
                  let a = actor.items.get(this.name);
                  await actor.updateEmbeddedDocuments("Item", [{_id: a.id, "data.quantity": count}]);
                  $(`a#${x.id}-ammo-count`).html(count);
                  $(`option#${a.id}-option`).html(`${a.data.name} (${count})` );
                  $(`a#roll-${a.id}`).html(`${a.data.name} (${count})`);
                  if (count > 0) $(`a#roll-${a.id}`).css('color', `unset`);
                });
                
                $(`a[id^=${x.id}-ammo-count]`).click(async function(e){
                  //$(this).off('onclick');
                  let count = parseInt($(`a#${x.id}-ammo-count`).html());
                  if (count > 0) {
                    count--;
                    let a = actor.items.get(this.name);
                    await actor.updateEmbeddedDocuments("Item", [{_id: a.id, "data.quantity": count}]);
                    $(`a#${x.id}-ammo-count`).html(count);
                    $(`option#${a.id}-option`).html(`${a.data.name} (${count})` );
                    $(`a#roll-${a.id}`).html(`${a.data.name} (${count})`);
                    if (count === 0) $(`a#roll-${a.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                $(`a[id^=${x.id}-charges-count]`).contextmenu(async function(e){
                  
                  //$(this).off('oncontextmenu');
                  let item  = actor.items.get(this.name);
                  
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  if (uses.value < uses.max) {
                    uses.value++;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${x.id}-charges-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${item.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value > 0) {
                    let whatUses = actor.items.filter(x => x.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`#roll-${w.id}`).css('color', `unset`);
                    $(`#roll-${item.id}`).css('color', `unset`);
                  }
                });
                
                $(`a[id^=${x.id}-charges-count]`).click(async function(e){
                  //$(this).off('onclick');
                  let item = actor.items.get(this.name);
                  
                  let uses = JSON.parse(JSON.stringify(item.data.data.uses));
                  console.log(uses, item.type);
                  if (uses.value > 0) {
                    uses.value--;
                    await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "data.uses": uses}]);
                    $(`a#${x.id}-charges-count`).html(`${uses.value}/${uses.max}`);
                    $(`a#roll-${item.id}`).html(`${item.data.name} (${uses.value}/${uses.max})`);
                  }
                  if (uses.value == 0) {
                    let whatUses = actor.items.filter(x => x.data.data.consume?.target === item.id)
                    for (let w of whatUses) $(`a#roll-${w.id}`).attr('style', `color : ${unavailable}`);
                    $(`a#roll-${item.id}`).attr('style', `color : ${unavailable}`);
                  }
                });
                
                $("a[id*=-spell-level-]").click(async function(e){
                  let item = x;// = actor.items.get($(this).attr('data'));
                  //ui.chat.processMessage(`<h2>${item.data.name}</h2><h3>Save ${x.labels.save}</h3>`);
                  let spellLevel = this.name;
                  console.log(item.data.data.level, spellLevel, spellLevel-parseInt(item.data.data.level));
                  let upcast = spellLevel-parseInt(item.data.data.level);
                  if (spellLevel==="0" && actor.type==='character') 
                    return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} ${upcast>0?'<br>Upcast ' + upcast:''} ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`});
                  if (spellLevel==="0" && actor.type==='npc') 
                    return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`, whisper: ChatMessage.getWhisperRecipients("GM")});
                  let spells = JSON.parse(JSON.stringify(actor.data.data.spells));
                  if (spells['spell'+spellLevel].value != 0) {
                    spells['spell'+spellLevel].value--;
                    if (spells['spell'+spellLevel].value < 1) {
                      for (const [key, value] of Object.entries(spells)){
                        if (value.max > 0) {
                          for (let level = parseInt(key.substr(-1)); level > 0; level--) {
                            if ('spell'+level === key ){
                              spells['spell'+level].slotsAvailable = false;
                            }
                            if (value.value > 0)
                              spells['spell'+level].slotsAvailable = true;
                          }
                        }
                      }
                    }
                    for (const [key, value] of Object.entries(spells)){
                      if (value.max > 0) {
                        if (value.slotsAvailable) 
                          $(`.${t}-${key}`).attr('style', `color : unset !important`);
                        else
                          $(`.${t}-${key}`).attr('style', `color : ${unavailable}`);
                      }
                    }
                    await actor.update({'data.spells': spells});
                    $(this).html(spells['spell'+spellLevel].value+'/'+spells['spell'+spellLevel].max);
                    if (actor.type==='character')
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} with a level ${spellLevel} slot  ${upcast>0?'<br>Upcast ' + upcast:''} ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`});
                    else
                      ChatMessage.create({speaker:ChatMessage.getSpeaker({actor: item.parent}),flavor:`Casts ${item.name} with a level ${spellLevel} slot  ${upcast>0?'<br>Upcast ' + upcast:''} ${(x.labels.save===undefined?'':'<br>Save '+x.labels.save)}`, whisper: ChatMessage.getWhisperRecipients("GM")});
                    if (actor.hasPlayerOwner)
                      ui.chat.processMessage(`/w GM ${actor.data.name} Level ${spellLevel} Slots: (${ spells['spell'+spellLevel].value}/${spells['spell'+spellLevel].max})`);
                  }
                });
                
                $("a[id*=-spell-level-]").contextmenu(async function(e){
                  let spellLevel = this.name;
                  if (spellLevel==="0") return;
                  let spells = JSON.parse(JSON.stringify(actor.data.data.spells));
                  if (spells['spell'+spellLevel].value != spells['spell'+spellLevel].max) {
                    spells['spell'+spellLevel].value++;
                  if (spells['spell'+spellLevel].value === 1) {
                    for (const [key, value] of Object.entries(spells)){
                      if (value.max > 0) {
                        for (let level = parseInt(key.substr(-1)); level > 0; level--) {
                          if ('spell'+level === key ){
                            spells['spell'+level].slotsAvailable = false;
                          }
                          if (value.value > 0)
                            spells['spell'+level].slotsAvailable = true;
                        }
                      }
                    }
                    for (const [key, value] of Object.entries(spells)){
                      if (value.max > 0) {
                        if (value.slotsAvailable) 
                          $(`.${t}-${key}`).attr('style', `color : unset !important`);
                        else
                          $(`.${t}-${key}`).attr('style', `color : ${unavailable}`);
                      }
                    }
                  }
                  await actor.update({'data.spells': spells});
                  $(this).html(spells['spell'+spellLevel].value+'/'+spells['spell'+spellLevel].max);
                  if (actor.hasPlayerOwner)
                    ui.chat.processMessage(`/w GM ${actor.data.name}<br>Gained a level ${spellLevel} slot <br>Level ${spellLevel} Slots: (${ spells['spell'+spellLevel].value}/${spells['spell'+spellLevel].max})<br>From: ${actor.items.get($(this).attr('data')).data.name}<br>`);
                  }    
                });
                
                let currentrollmode = game.settings.get("core", "rollMode");
                //$(`.inline-roll`).attr('data-mode', currentrollmode);
                //if (!$(`#item-rolls-dialog-${t}-${x.id}`).hasClass('clickToToken'))
                $(`#item-rolls-dialog-${t}-${x.id}`).click(async function(e){
                  console.log(t);
                  let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
                  if (placeables.length > 0)
                    placeables[0].control({releaseOthers:true});
                  else 
                    canvas.tokens.releaseAll();
                });
                $(`#item-rolls-dialog-${t}-${x.id}`).addClass('clickToToken');
                //$(`.inline-roll`).attr('data-mode', game.settings.get("core", "rollMode"));
              },
              close:   html => {
              return}
              
            },{  id:`item-rolls-dialog-${t}-${x.id}`, left : e.clientX-5 , top: e.clientY-5 }).render(true);
        
      });
      
      $("a[id^=roll]").contextmenu(async function(e){
        actor.items.get(this.name).sheet.render(true);
      });
      
      $(".item-img").click(async function(e){
        actor.items.get(this.name).roll(true);
      });
      
      //$(`#items-dialog-${t}`).off('click');
      //if (!$(`#items-dialog-${t}`).hasClass('clickToToken'))
      $(`#items-dialog-${t}`).click(async function(e){
        console.log(t);
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
        
        for ( let w of Object.values(ui.windows).filter(w=> w.id.includes(`item-rolls-dialog-${t}`)))
          ui.windows[w.appId].bringToTop();
      });
      //$(`#items-dialog-${t}`).addClass('clickToToken');
  },
  close:   html => {
    console.log($(`[id^=item-rolls-dialog-${t}]`).length ,closeOnMouseLeave )
    if ($(`[id^=item-rolls-dialog-${t}]`).length && !closeOnMouseLeave) 
      $(`[id^=item-rolls-dialog-${t}]`).each(function(){ui.windows[$(this).attr('data-appid')].close()});
    ui.nav._element.show();
    return;}
  },position
);
//d.render(true);
  
  return true;
}
  
  
static async chatMessagesDialog(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  if (!game.user.isGM) return;

async function toggleEffect(effect) {
  for (let t of canvas.tokens.controlled) {
  let actorUuid = t.actor.uuid;
  await game.dfreds.effectInterface.toggleEffect(effect, actorUuid);
  }
}
async function controlUserTargets(section) {
  let userTargets = game.users.getName(section.replace('act-','')).targets;
  for (const target of userTargets){
  target.control({releaseOthers: false});
  }
}

let ce = game.modules.get("dfreds-convenient-effects").active;

let title = "Roll Messages";
let windowId = "roll-messages-dialog"
let position = { height: 800, width : 420 , id: windowId};
let header = `<h4><a onclick="dnd5eByDialog.chatMessagesDialog()"  style="margin: 0 0 0 0;">${title}</a></h4>`
if (!Hooks._hooks.renderChatMessage || Hooks._hooks.renderChatMessage?.findIndex(f=>f.toString().includes('renderchatmessagesdialog'))==-1)
  Hooks.on(`renderChatMessage`, (message, html, data) => { 
    //renderchatmessagesdialog
    if (Object.values(ui.windows).filter(w=> w.id === "roll-messages-dialog" && (message.data.flavor || message.data._roll))){
      dnd5eByDialog.chatMessagesDialog();
      //console.log('new message:', message);
    }
  });
if (!Hooks._hooks.deleteChatMessage || Hooks._hooks.deleteChatMessage?.findIndex(f=>f.toString().includes('renderchatmessagesdialog'))==-1)
  Hooks.on(`deleteChatMessage`, (message, html, data) => { 
    //renderchatmessagesdialog
    if (Object.values(ui.windows).filter(w=> w.id === "roll-messages-dialog" && (message.data.flavor || message.data._roll))){
      dnd5eByDialog.chatMessagesDialog();
      //console.log('new message:', message);
    }
  });
//${$("#roll-messages-dialog").height()-55}px    height: 640px;
let content=`
<div id="messages-dialog-content" style="display:flex; flex-direction: column-reverse;  width: 410px; height: 760px; overflow-y: auto; overflow-x: hidden; ">
`;
let users = {};
let usersDamageTotal = {};
let usersLastAttack = {};
let usersAttackCritical = {};
let usersDamageCritical = {}
let messages = [];
let saves = {};
let damageTaken = {};
//for (const m of game.messages.contents){
//let damageTotal = 0;
//let lastAttack = 0;
//let header = 'Chat Messages';
//for (let i = game.messages.contents.length - 1; 0 <= i; i--) {
for (let m of game.messages.contents.filter(m=> ((m.data.roll || m.data.flavor) && m.data.speaker.alias) || (m.data.speaker.alias === undefined && m.data.flavor?.includes('Round'))).reverse()) {
  //let m = game.messages.contents[i];
  let total = 0;
  let message = ``;
  let user = '';
  let damage = '';
  if (m.data.speaker.alias);
    user = m.data.speaker.alias;//game.users.get(m.data?.user)?.data.name;
  if (user === undefined && m.data.flavor?.includes('Round')) {
  //header = m.data.flavor + ' Messages';margin-top:.5em;
    messages.push(`<div><hr><h2 style="border-top: 1px solid var(--color-underline-header); margin-top:.6em;">${m.data.flavor}</h2></div>`)
    //rounds[m.data.flavor] = users;
    //users = {};
    continue;
  }
  //if (!m.data.flavor) continue; 
  //if (!m.data.speaker.alias) continue;
  //if (!m.data.roll && !m.data.flavor) continue; 
  if (!users[user])
    users[user] = [];
  if (!usersDamageTotal[user])
    usersDamageTotal[user] = {};
  if (!usersAttackCritical[user])
    usersAttackCritical[user] = false;
  if (!usersDamageCritical[user])
    usersDamageCritical[user] = false;
  if (!saves[user])
      saves[user] = {};
  
  message += `<div style="" class="cm" name="${user}"><hr>
  <span style="float:right; clear:both; margin-right: 5px;">
  <a class="speaker" data-token="${m.data.speaker.token}">${user}</a>
  </span>
  <p>`;//dnd5eByDialog.characterDialog();
  let flavor = ``;
  if (m.data.flavor) 
    flavor += `${m.data.flavor}`;
    
  if (m.data.flavor && ce) {
    let foundEffects = game.dfreds.effects.all.filter(e => flavor.includes(e.name));
    if (foundEffects.length > 0) 
      flavor = flavor.replace(foundEffects[0].name, `<a class="effect-button" name="${foundEffects[0].name}">${foundEffects[0].name}</a>`); 
  }
  message += flavor + `</p>`;
  if (m.data.roll) {
    let roll = JSON.parse(m.data.roll);//Roll.fromJSON(m.data.roll);//
    //let roll = m.roll;
    //console.log($(await roll.getTooltip()).find(".dice-rolls"));//
    //console.log(roll.terms);
    let title = '';
    for (let term of roll.terms.filter(t => t.class === 'Die')) {
      title += term.number + 'd' + term.faces + ` => `;
      let resultResults = [];
      for (let result of term.results){
        resultResults.push(result.result);
        //console.log(m.data.flavor.includes('Attack') , term.faces === 20 ,result.result === 20 , result.result.active);
        if (m.data.flavor?.includes('Attack') && term.faces === 20 && result.result === 20 && result.active)
          usersAttackCritical[user] = true;
      }
      title += resultResults.join(', ') + `\n`;
    }
    if (m.data.flavor?.toUpperCase().includes('ATTACK'))
      usersLastAttack[user] = roll.total;
    
    if (m.data.flavor?.toUpperCase().includes('DAMAGE') || m.data.flavor?.toUpperCase().includes('HEALING')){
      let dt = m.data.flags?.world?.damageType;
      if (dt && !usersDamageTotal[user][dt]) usersDamageTotal[user][dt] = 0;
      usersDamageTotal[user][dt] += roll.total;
      //message = message.replace('<hr>','');
      if (m.data.flavor?.toUpperCase().includes('CRITICAL'))
        usersDamageCritical[user] = true;
    }
    if (m.data.flavor?.toUpperCase().includes('ATTACK'))
      message += `<p title="${title}"><a class="applyTargets" data-mid="${m.id}">${roll.formula} =  ${roll.total}</a></p>`;
    else
      message += `<p title="${title}"><a class="applyDamage" data-val="${roll.total}" data-crit="${usersAttackCritical[user]}">${roll.formula} =  ${roll.total}</a> </p>`;
    /*
    if (m.data.flavor?.toUpperCase().includes('ATTACK') && Object.keys(usersDamageTotal[user]).length !== 0){
      let totalTotal = 0;
      for (let [key, value] of Object.entries(usersDamageTotal[user])) {
        message += `<p title="${title}"><b><a class="HVM" data-val="${value}" data-crit="${usersAttackCritical[user]}">${key} Damage: ${value}</a></b></p>`;
        totalTotal += value;
      }
      if (Object.keys(usersDamageTotal[user]).length !== 1)
        message += `<p title="${title}"><u><b><<a class="HVM" data-val="${value}" data-crit="${usersAttackCritical[user]}">Total Damage: ${totalTotal}</a></b></u></p>`;
      //usersDamageTotal[user] = {};
    }*/
    //if (m.data.roll)
      //message += `<span class="dice-tooltip" style="color:#000 !important"> ${$(await m.roll.getTooltip()).find(".dice-rolls")[0].outerHTML}</span>`;
  }
  if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR')||m.data.flavor?.toUpperCase().includes('ATTACK') && Object.keys(usersDamageTotal[user]).length !== 0){
    let totalTotal = 0;
    for (let [key, value] of Object.entries(usersDamageTotal[user]).reverse()) {
      message += `<p><b><a class="applyDamage" data-val="${value}" data-crit="${usersAttackCritical[user]}">${key} Damage:  ${value}</a>`;
      if (game.modules.get("mmm").active && usersAttackCritical[user])
        message += `&ensp;<a onclick="ui.chat.processMessage('/mmmm ${key}')">MMMM</a>`;
      message += `</b></p>`;
        
        totalTotal += value;
    }
    if (Object.keys(usersDamageTotal[user]).length > 1)
      message += `<p><u><b><a class="applyDamage" data-val="${totalTotal}" data-crit="${usersAttackCritical[user]}">Total Damage:  ${totalTotal}</a></b></u></p>`;
    //usersDamageTotal[user] = {};
    
  }
    
  
  if (m.data.flags?.world?.save !== undefined && m.data.speaker.token) {
    //console.log(Object.keys(m.data.flags.world.save), Object.values(m.data.flags.world.save));
    saves[user][Object.keys(m.data.flags.world.save)[0]] = Object.values(m.data.flags.world.save)[0];
  }
  
  if (m.data.flags.world?.targetIds && m.data.flags.world?.targetIds?.length > 0) 
    message += `<b><a class="target-button" name="${m.data.flags.world?.targetIds.join('-')}" style="margin-right: .3em"><i class="fas fa-crosshairs"></i> Targets</a></b>`;  
  //console.log(saves);
  
  if (m.data.flags?.world?.targetIds) {
    let hits = [];
    let saved = [];
    let failed = [];
    let targets = '';
    for (let t_id of m.data.flags.world?.targetIds){
      let t = canvas.tokens.get(t_id);
      if (!t) continue;
      let traits = '';
      //&& t.actor.data.data.traits[key]?.value?.length
      for (const [key, value] of Object.entries(t.actor.data.data.traits)) {
        if ((key == 'di' || key == 'dr' || key == 'dv') && t.actor.data.data.traits[key]?.value?.length) {
          traits += `\n${key.toUpperCase()}: ${value.value.join(', ')}`;
        }
      }
      
      if (m.data.flavor?.toUpperCase().includes('ATTACK') &&
      usersLastAttack[user] >=t.actor.data.data.attributes.ac.value)
        hits.push(t_id);
      if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR') && saves[user][t.id] === "Succeeded")
        saved.push(t_id);
      if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR') && saves[user][t.id] === "Failed")
        failed.push(t_id);
        
      
      
      targets += `<div style="margin: 5px 0 0 0;"><a onclick="canvas.animatePan({x:${t.data.x}, y:${t.data.y}})" ><img src="${t.data.img}" height="36" style="border:unset; float: left; clear:both; margin-right: 5px;"></a><a class="target-img" data-id="${t_id}">${t.actor.data.name} ${traits}<br>` ;
      
      if (m.data.flavor?.toUpperCase().includes('ATTACK')) 
        targets += `AC: ${t.actor.data.data.attributes.ac.value} (${usersLastAttack[user]>=t.actor.data.data.attributes.ac.value?'hits':'misses'})&nbsp;`;
        
      if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR')) 
        targets += `<b>${saves[user][t.id]}</b> Save &nbsp;`;
        
      if (m.data.flavor?.toUpperCase().includes('CAST'))
        targets += ``;
        
      if (m.data.flavor?.toUpperCase().includes('HEALING')) 
        targets += ``;
        
      for (let [key, value] of Object.entries(usersDamageTotal[user]).reverse()) {
        if (t.actor.data.data?.traits?.dv?.value?.includes(key.toLowerCase())) value *= 2;
        if (t.actor.data.data?.traits?.di?.value?.includes(key.toLowerCase())) value = 0;
        if (t.actor.data.data?.traits?.dr?.value?.includes(key.toLowerCase())) value = Math.floor(value/2);
        
        if (hits.includes(t_id) || failed.includes(t_id))
          targets += `<a class="applyDamage" data-val="${key.toUpperCase().includes('HEALING')?value*-1:value}" data-crit="${usersAttackCritical[user]}" data-token="${t_id}"> ${value} ${key}</a>&nbsp;`;
        if (saved.includes(t_id))
          targets += `<a class="applyDamage" data-val="${key.toUpperCase().includes('HEALING')?value*-1:value}" data-crit="${usersAttackCritical[user]}" data-token="${t_id}"> ${Math.floor(value/2)} ${key}</a>&nbsp;`;
      }
      
      targets += `</a><a class="x-target" data-tid="${t_id}" data-mid="${m.id}"><i class="fas fa-times" style="float:right; font-size: 1.25em; margin-right: 1em;"></i></a></div>`;
      
    }
    if (m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR'))
      saves[user] = {};
    //console.log(m, hits, saved, failed);
    for (let t_id of hits) {
      if (!damageTaken[t_id]) damageTaken[t_id] = [];
      damageTaken[t_id].unshift(usersDamageTotal[user]);
    }
    
    
    if (hits.length > 1 || saved.length > 0 || failed.length > 0)
      message += '<b style="margin-right: .5em">Targets:</b>';
    if (hits.length > 1)
      message += `<a class="target-button" name="${hits.join('-')}" style="margin-right: .5em"><b>Hits</b></a>`
    if (saved.length > 0)
      message += `<a class="target-button" name="${saved.join('-')}" style="margin-right: .5em"><b>Saved</b></a>`
    if (failed.length > 0)
      message += `<a class="target-button" name="${failed.join('-')}" style="margin-right: .5em"><b>Failed</b></a>`
    hits = [];
    saved = [];
    failed = [];
    
    
    message += targets;
  }
  usersDamageCritical[user] = false;
  usersAttackCritical[user] = false;
  if (m.data.flavor?.toUpperCase().includes('ATTACK') || m.data.flavor?.toUpperCase().includes('HEALING') || m.data.flavor?.toUpperCase().includes('ROLLING SAVES FOR')) usersDamageTotal[user] = {};
  message += `</div>`
  //users[user].push(message);  
  messages.push(message);
  //m = game.messages.contents[game.messages.contents.length - i];
}

console.log(damageTaken);
for (const m of messages) {
        content += m; 
}
content += '</div>';
//console.log(users);<center style="border-bottom: 0px solid white;"></center>
//let selectedAlias = $(`#alias-select`).val();
//if (game.combats.active?.combatant) selectedAlias = $(`#alias-select`).val(game.combats.active.combatant.name);
//console.log($(`#alias-select`).val(), selectedAlias.val());
let aliasSelect = `<div style="position: absolute; top: 4px; left: 100px; "><select id="alias-select" style="height: 20px; margin-bottom:.5em;  width: 100%;"><option value="" ${$('#alias-select').val()===""?'selected':''}></option>`;
for (const alias of Object.keys(users).sort()) {
  aliasSelect +=  `<option value="${alias}" ${$('#alias-select').val()===alias?'selected':''}>${alias}</option>`;
}
aliasSelect += `</select></div>`;
content = aliasSelect + content;

Dialog.persist({
  title: title,
  content:  content,
  buttons: {},
  render: (html) => {
    $("#messages-dialog-content").css('height', `${$("#roll-messages-dialog").height()-55}px`)
    //$('#messages-dialog-content').scrollTop($('#messages-dialog-content').height());
    if ($('#alias-select').val()) {
        $(`div.cm`).css('display', 'none');
        $(`div[name="${$('#alias-select').val()}"]`).css('display', 'unset');
    }
    else
      $(`div.cm`).css('display', 'unset');
        
    //$(`#${position["id"]} > header > h4`).html(header);
    
    //$(html[0]).parent().css("flex-direction", 'column-reverse');
    
    $('#alias-select').change(async function(e){
      if ($('#alias-select').val()) {
        $(`div.cm`).css('display', 'none');
        $(`div[name="${$('#alias-select').val()}"]`).css('display', 'unset');
      }
      else
        $(`div.cm`).css('display', 'unset');
    });
    
    $('#alias-select').contextmenu(async function(e){
      $(this).val('').change();
    });
    
    $('.applyTargets').click(async function(e){
      let m_id = $(this).attr('data-mid');
      await game.messages.get(m_id).update({"flags.world.targetIds": [...game.user.targets].map(t=>t.id)});
      dnd5eByDialog.chatMessagesDialog();
    });
    
    $('.applyDamage').click(async function(e){
      let t_id = $(this).attr('data-token');
      if (t_id)
        game.user.updateTokenTargets([t_id]);
        
      //let target = canvas.tokens.get(t_id);
      for ( let target of game.user.targets) {
        if (e.ctrlKey) 
          target.actor.applyDamage($(this).attr('data-val'),.5);
        else if (e.shiftKey) 
          target.actor.applyDamage($(this).attr('data-val'), 2);
        else
          target.actor.applyDamage($(this).attr('data-val'));
      }
    });
    
    $('.applyDamage').contextmenu(async function(e){
      let t_id = $(this).attr('data-token');
      if (t_id)
        game.user.updateTokenTargets([t_id]);
      //let target = canvas.tokens.get(t_id);
      for ( let target of game.user.targets) {
        if (e.ctrlKey) 
          target.actor.applyDamage($(this).attr('data-val')*-1,.5);
        else if (e.shiftKey) 
          target.actor.applyDamage($(this).attr('data-val')*-1, 2);
        else
          target.actor.applyDamage($(this).attr('data-val')*-1);
      }
    });
    
    $('.speaker').contextmenu(async function(e){
      canvas.tokens.get($(this).attr('data-token')).control({releaseOthers:true});canvas.animatePan({x:_token.data.x, y:_token.data.y});
    });
    
    $('.speaker').click(async function(e){
      return game.user.updateTokenTargets([$(this).attr('data-token')]);
      if ([...game.user.targets].length>0) game.user.updateTokenTargets([]);
      else game.user.updateTokenTargets($(this).attr('name').split('-'));
    });
    
    $('a.x-target').click(async function(e){
      let t_id = $(this).attr('data-tid');
      let m_id = $(this).attr('data-mid');
      //let targetButton = $(this).parent().prev().prev().prev().find('a.target-button');
      let targetButton = $(this).parent().parent().find('a.target-button');
      console.log(targetButton);
      let targets = targetButton.attr('name').split('-');
      targets.splice(targets.indexOf(t_id),1);
      targetButton.attr('name', targets.join('-'));
      let m = game.messages.get(m_id);
      $(this).parent().remove();
      await ChatMessage.updateDocuments([{_id: m_id, "flags.world.targetIds" : targets}]);
    });
    
    $('a.target-img').contextmenu(async function(e){
      //return game.user.updateTokenTargets([]);
      let t_Id = $(this).attr('data-id');
      console.log(t_Id);
      //let t = canvas.tokens.get(t_Id);
      let targets = [...game.user.targets].map(t => t.id);
      console.log(targets);
      if (targets.includes(t_Id)) targets.splice(targets.indexOf(t_Id),1);
      game.user.updateTokenTargets(targets);
      /*
      if (!t._controlled)
        t.control({releaseOthers: false});
      else
        t.release();*/
    });
    
    $('a.target-img').click(async function(e){
      let t_Id = $(this).attr('data-id');
      //return game.user.updateTokenTargets([t_Id]);
      let targets = [...game.user.targets].map(t => t.id);
      if (!targets.map(t => t.id).includes(t_Id)) targets.push(t_Id);
      //else targets.splice([...game.user.targets].indexOf(t_Id),1);
      game.user.updateTokenTargets(targets);
    });
    /*
    $("a.target-img > img").hover((e) => {
            let panTarget = canvas.tokens.get($(e.originalEvent.srcElement).parent().attr('data-id'));
            canvas.animatePan({x: panTarget.data.x, y: panTarget.data.y});
        },() => {});
    */
    $('a.target-button').contextmenu(async function(e){
      return game.user.updateTokenTargets([]);
      let t_Ids = $(this).attr('name').split('-');
      if (canvas.tokens.controlled.length==0) {
        canvas.tokens.releaseAll();
        for (let t_Id of t_Ids) {
          canvas.tokens.get(t_Id).control({releaseOthers: false});
        }
      } else {
        canvas.tokens.releaseAll();
      }
    });
    
    $('a.target-button').click(async function(e){
      return game.user.updateTokenTargets($(this).attr('name').split('-'));
      if ([...game.user.targets].length>0) game.user.updateTokenTargets([]);
      else game.user.updateTokenTargets($(this).attr('name').split('-'));
    });
    
    if (ce)
    $('a.effect-button').click(async function(e){
      let effect = $(this).attr('name');
      await game.dfreds.effectInterface.toggleEffect(effect, {uuids: [...game.user.targets].map(t=>t.actor.uuid)});
    });
  
  },
  close:   html => {
    while (Hooks._hooks.renderChatMessage?.findIndex(f=>f.toString().includes('renderchatmessagesdialog'))>-1)
      Hooks._hooks.renderChatMessage.splice( Hooks._hooks.renderChatMessage.findIndex(f=>f.toString().includes('renderchatmessagesdialog')), 1)
    while (Hooks._hooks.deleteChatMessage?.findIndex(f=>f.toString().includes('renderchatmessagesdialog'))>-1)
      Hooks._hooks.deleteChatMessage.splice( Hooks._hooks.deleteChatMessage.findIndex(f=>f.toString().includes('renderchatmessagesdialog')), 1)  
      
  return}
},position
);
//d.render(true);
  
  return true;
}
  
  
static async whisperRequestInlineRoll(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  let app = Object.values(ui.windows).find(w=>w.id.includes('request-roll-dialog'));
if (app) app.close();

let content=`
<style>
center > div > label:before {
content: '';
  width: 32px;
  height: 32px;
  position: absolute;
  z-index: 100;
}
center > div > :checked+label::before  {
content: '';
  width: 32px;
  height: 32px;
  border: 2px solid darkred;
}
.mir, .mirm  {
      background: #DDD;
      padding: 1px 4px;
      border: 1px solid #4b4a44;
      border-radius: 2px;
      white-space: nowrap;
      word-break: break-all;
      text-align: center;
      margin-bottom: .5em;
    }
</style>
`;
content += `<center><div id="targets" >`;
for (const u of [...game.users].filter(u=>!u.isGM && u.name!=='test')){
        content += `<input type="checkbox" class="macro-users" id="user-${u.id}" name="${u.id}" style="display: none;"/>
        <label for="user-${u.id}" class="user-label" title="${u.name}" name="${u.id}"  /><img height="36" width="36" src="${u.character?u.character.data.img:'icons/svg/cowled.svg'}" style="cursor: pointer"></label>`;
}
content += `
<a id="built-roll" class="inline-roll roll" data-mode="roll" data-flavor="" data-formula="" style="display:none"></a>
  <div style="display: grid; grid-template-columns: repeat(8, 1fr ); margin-top: .5em; margin-bottom: .5em">
      <center></center><center></center>
      <center><a title="roll" class="mirm">/r</a></center>
      <center><a title="gmroll" class="mirm">/gmr</a></center>
      <center><a title="blindroll" class="mirm">/br</a></center>
      <center><a title="selfroll" class="mirm">/sr</a></center>
      <center></center><center></center>
  </div></div>`;
  //let a = u.character;
  let abilities = ``;
  let saves = ``;
  for (const [key, value] of Object.entries(CONFIG.DND5E['abilities'])){
      //let text = CONFIG.DND5E['abilities'][key] ;
      abilities += `<a title="${value} Test" class="mir" data-type="test" data-key="${key}"  style="margin: .1em;">${key.toUpperCase()}</a>`;
      saves += `<a title="${value} Save" class="mir" data-type="save" data-key="${key}" style="margin: .1em;">Save</a>`;
  }
  let skills = ``;
  for (const [key, value] of Object.entries(CONFIG.DND5E['skills'])){
      //let text = CONFIG.DND5E['skills'][key] ;
      skills += `
      <a title="${value} Check" class="mir" data-type="skill" data-key="${key}" style="margin: .1em;">${value}</a>
        `;
  }
  
  content += `
  <div style="display: grid; grid-template-rows: auto auto;">
	<div style="display: grid; grid-template-columns: repeat(6, 1fr);">
	  ${abilities}
	</div>
	<div style="display: grid; grid-template-columns: repeat(6, 1fr); margin-bottom: .25em">
	  ${saves}
	</div>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr);margin-bottom: .25em"">
    ${skills}
	</div>
	</div>
	<center><input id="roll-request-dc" style=" text-align: center; font-weight:bold;" placeholder="DC"></input></center>
  `;
Dialog.persist({
  title: `Request Rolls`,
  content:  content,
  buttons: {},
  render: (content) => {
      let currentrollmode = game.settings.get("core", "rollMode")
    $(`#built-roll`).attr('data-mode', currentrollmode);
    $(`[title='${currentrollmode}']`).css('textShadow' , "0 0 8px red");
    $(`a.mir`).click(async function(e){
      let users = [];
      $('.macro-users:checked').each(function () {
          users.push(`${$(this).attr('name')}`);
      });
      for (let u of users){
        let dc = $("#roll-request-dc").val();
        let user = game.users.get(u);
        let a = user.character;
        console.log(u)
        let roll = '1d20';
        let flavor = $(this).attr('title');
        if (e.ctrlKey) 
            roll = '2d20kl';
        if (e.shiftKey)
            roll = '2d20klh';
        if (e.ctrlKey) 
            flavor += ' with disadvantage';
        if (e.shiftKey)
            flavor += ' with advantage';
        let bonus = '';
        let type = $(this).attr('data-type');
        console.log(type)
        switch (type) {
          case 'test':
            bonus += a.data.data.abilities[$(this).attr('data-key')].mod;
            break;
          case 'save':
            bonus += a.data.data.abilities[$(this).attr('data-key')].save;
            break;
          case 'skill':
            bonus += a.data.data.skills[$(this).attr('data-key')].total;
            break;
          default:
            return;
        }    
        let formula = roll + '+' + bonus;
        let content = `Roll ${flavor} [[${$('.mirm[title='+game.settings.get("core", "rollMode")+']').text()} ${formula} # ${flavor}]]`;
        if (dc)
          content += "<br>DC: " + dc;
        ChatMessage.create({
             speaker: ChatMessage.getSpeaker({actor:user.character}),
             //type: 4,
             content ,
             whisper: [u]
        });
      }
    });
    $('a.mirm').click(async function(e){
        $(`#built-roll`).attr('data-mode', $(this).attr('title'));
        $(`#built-roll`).attr('data-rm', $(this).text());
        game.settings.set("core", "rollMode", $(this).attr('title'));
        $("a.mirm").css('textShadow' , "unset");
        $(this).css('textShadow' , "0 0 8px red");
    });
  },
  close:   html => {
      return}
},{width: 330 , left: 110, top: 80, id:`request-roll-dialog` }
);
  
  return true;
}
  
  
static async inlineRollBuilder(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  if (!actor) actor = game.user.character;
//if (!actor) actor = _token?.actor;
//if (!actor) ui.notifications.warn('No Token!');


let content  = `<style>
  .mir {
    background: #DDD;
    padding: 1px 4px;
    border: 1px solid #4b4a44;
    border-radius: 2px;
    white-space: nowrap;
    word-break: break-all;
  }
</style>`;//<a id="built-roll-save">  Save<a>
content += `<table><tr><th style="height:2em">
<a id="built-roll" class="inline-roll roll" data-mode="roll" data-flavor="" data-formula=""><i class="fas fa-dice-d20"></i></a><br>
<a onclick="$(this).next().val('Attack'); $(this).parent().find(':first-child').attr('data-flavor','Attack');">ATTACK</a>&nbsp;
<input id="built-roll-flavor" style=" text-align: center; font-weight:bold;" placeholder="Flavor"></input>&nbsp;
<a onclick="$(this).prev().val('Damage'); $(this).parent().find(':first-child').attr('data-flavor','Damage');">Damage</a>&nbsp;
  </th></tr>
  <tr><th>
    <a id="ib-dc" class="mir">dc</a>
    <a id="ib-d3" class="mir">df</a>
    <a id="ib-d2" class="mir">d2</a>
    <a id="ib-d4" class="mir">d4</a>
    <a id="ib-d6" class="mir">d6</a>
    <a id="ib-d8" class="mir">d8</a>
    <a id="ib-d10" class="mir">d10</a>
    <a id="ib-d12" class="mir">d12</a>
    <a id="ib-d20" class="mir">d20</a>
    <a id="ib-d100" class="mir">d100</a>
    <a id="ib-1" class="mir">#</a>
  </th></tr>
  
  `;
  if (actor)
    content += `<tr><th>
    <a id="ib-prof" class="mir">${actor.data.data.attributes.prof}[prof]</a>
    <a id="ib-str" class="mir">${actor.data.data.abilities.str.mod}[str]</a>
    <a id="ib-dex" class="mir">${actor.data.data.abilities.dex.mod}[dex]</a>
    <a id="ib-con" class="mir">${actor.data.data.abilities.con.mod}[con]</a>
    <a id="ib-int" class="mir">${actor.data.data.abilities.int.mod}[int]</a>
    <a id="ib-wis" class="mir">${actor.data.data.abilities.wis.mod}[wis]</a>
    <a id="ib-cha" class="mir">${actor.data.data.abilities.cha.mod}[cha]</a>
    
  </th></tr>`;
  content += `</table>`;
  let rollModeButtons = `

<div style="display: grid; grid-template-columns: 2fr repeat(7, 1fr) 2fr;">
    <i></i>
    <a title="publicroll" class="mirm publicroll">/pr</a>
    <i></i>
    <a title="gmroll" class="mirm gmroll">/gmr</a>
    <i></i>
    <a title="blindroll" class="mirm blindroll">/br</a>
    <i></i>
    <a title="selfroll" class="mirm selfroll">/sr</a>
    <i></i>
</div>`;
let d = new Dialog({
  title: `Inline Roll Builder ` + (actor?`[${actor.data.name}]`:''),
  content:  content + rollModeButtons,
  buttons: {},
  render: (content) => {
    
    $("input#built-roll-flavor").keyup(function(){
        $("#built-roll").attr('data-flavor',$(this).val())
    }); 
    $("#built-roll-save").click(async function(e){
      console.log(`/r ${$("#built-roll").attr('data-formula')} # ${$("#built-roll").attr('data-flavor')}`)
      $("textarea#chat-message").text(`/r ${$("#built-roll").attr('data-formula')} # ${$("#built-roll").attr('data-flavor')}`);
    });
    $('a.mirm').click(async function(e){
        $(`#built-roll`).attr('data-mode', $(this).attr('title'));
        //ChatLog._setRollMode($(this).attr('title'));
        game.settings.set("core", "rollMode", $(this).attr('title'));
        $("a.mirm").css('textShadow' , "unset");
        $(this).css('textShadow' , "0 0 8px red");
    });
    $(`a[id^=ib-]`).click(async function(e){
        let targetElement = $("#built-roll");
        let toAdd = $(this).text();
        let add = true;
        let remove = [];
        let rollArray = Roll.parse(targetElement.attr('data-formula'));
        //console.log(rollArray);
        if (rollArray.length > 0) {
          for (let i = rollArray.length-1; i >= 0; i--) {
              if (rollArray[i].constructor?.name === 'Die') {
                //console.log('die detected', toAdd.replace('d',''))
                  if (rollArray[i].faces === parseInt(toAdd.replace('d',''))) {
                    //console.log('like die detected')
                    //console.log('i-1',rollArray[i-1]);
                    if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
                      if (rollArray[i-1].operator === '-')
                        rollArray[i].number--;
                      else
                        rollArray[i].number++;
                    else
                      rollArray[i].number++;
                    if (rollArray[i].number === 0)
                      remove.push(i);
                    add = false;
                    break;
                  }
              }
          //}
          //for (let i = rollArray.length-1; i >= 0; i--) {
              if (rollArray[i].constructor?.name === 'NumericTerm' && rollArray[i].options.flavor === undefined && !toAdd.includes('[') && !toAdd.includes('d')) {
                if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
                  if (rollArray[i-1].operator === '-')
                    rollArray[i].number--;
                  else
                    rollArray[i].number++;
                else
                  rollArray[i].number++;
                if (rollArray[i].number === 0)
                  remove.push(i);
                add = false;
                //break;
              }
              
              if (rollArray[i].constructor?.name === 'NumericTerm' && toAdd.includes('[')) {
                if (rollArray[i].flavor === Roll.parse(toAdd)[0].flavor || rollArray[i].flavor === Roll.parse(toAdd)[1]?.flavor)
                  add = false;
                //break;
              }
          }
        }
        else
          rollArray = [];
        
        //console.log('remove', remove);
        for (let i of remove) {
          //console.log('removing', rollArray[i]);
          rollArray.splice(i, 1);
          if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
            rollArray.splice(i-1, 1);
        }
          
        if (add) {//&& !targetElement.attr('data-formula').includes('[')
          if (toAdd.includes('[') )
            toAdd = ' + '+toAdd;
          if (toAdd === '#')
            toAdd = ' + 1';
          if (toAdd.includes('d') && !toAdd.includes('['))
            toAdd = ' + 1'+toAdd;
        }
        console.log(rollArray, toAdd);
        if (add)
          rollArray = rollArray.concat(Roll.parse(toAdd))
        if (rollArray[0]?.constructor.name === 'OperatorTerm' && rollArray[0].operator === "+")
          rollArray.shift();
          
          
        //console.log(rollArray);
        let formula = '';
        if (rollArray.length > 0)
          formula = Roll.fromTerms(rollArray).formula;
        //console.log(formula);
        targetElement.attr('data-formula', formula);
        targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
    });
    
    //-------------------------------------------------------------------------------------------
    
    $(`a[id^=ib-]`).contextmenu(async function(e){
        let targetElement = $("#built-roll");
        let toAdd = $(this).text();
        let add = true;
        let remove = [];
        let rollArray = Roll.parse(targetElement.attr('data-formula'));
        //console.log(rollArray);
        if (rollArray.length > 0) {
          for (let i = rollArray.length-1; i >= 0; i--) {
              if (rollArray[i].constructor?.name === 'Die') {
                //console.log('die detected', toAdd.replace('d',''))
                  if (rollArray[i].faces === parseInt(toAdd.replace('d',''))) {
                    //console.log('like die detected')
                    //console.log('i-1',rollArray[i-1]);
                    if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
                      if (rollArray[i-1].operator === '-')
                        rollArray[i].number++;
                      else
                        rollArray[i].number--;
                    else
                      rollArray[i].number--;
                    if (rollArray[i].number === 0)
                      remove.push(i);
                    add = false;
                    //break;
                  }
              }
          //}
          //for (let i = rollArray.length-1; i >= 0; i--) {
              if (rollArray[i].constructor?.name === 'NumericTerm' && rollArray[i].options.flavor === undefined && !toAdd.includes('[') && !toAdd.includes('d')) {
                //console.log('i-1',rollArray[i-1]);
                if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
                  if (rollArray[i-1].operator === '-')
                    rollArray[i].number++;
                  else
                    rollArray[i].number--;
                else
                  rollArray[i].number--;
                if (rollArray[i].number === 0)
                  remove.push(i);
                add = false;
                //break;
              }
              if (rollArray[i].constructor?.name === 'NumericTerm' && toAdd.includes('[')) {
                if (rollArray[i].flavor !== "" && (rollArray[i].flavor === Roll.parse(toAdd)[0].flavor || rollArray[i].flavor === Roll.parse(toAdd)[1]?.flavor)) {
                  add = false;
                  remove.push(i);
                  if (rollArray[i-1]?.constructor?.name === 'OperatorTerm' && rollArray[i-1].operator === '-')
                    remove.push(i-1);
                }
                //break;
              }
          }
        }
        else
          rollArray = [];
          
        if (toAdd.includes('['))
          add = false;
        console.log('remove', remove);
        for (let i of remove) {
          console.log('removing', rollArray[i]);
          rollArray.splice(i, 1);
          if (rollArray[i-1]?.constructor?.name === 'OperatorTerm')
            rollArray.splice(i-1, 1);
        }
        
        if (add) {
          if (toAdd.includes('['))
            toAdd = ' - '+toAdd;
          if (toAdd === '#')
            toAdd = ' - 1';
          if (toAdd.includes('d') && !toAdd.includes('['))
            toAdd = ' - 1'+toAdd;
        }
        console.log(rollArray, toAdd);
        if (add)
          rollArray = rollArray.concat(Roll.parse(toAdd))
        if (rollArray[0]?.constructor.name === 'OperatorTerm' && rollArray[0].operator === "+")
          rollArray.shift();
        if (rollArray[rollArray.length-1]?.constructor.name === 'OperatorTerm' )
          rollArray.pop();
          
          
        //console.log(rollArray);
        let formula = '';
        if (rollArray.length > 0)
          formula = Roll.fromTerms(rollArray).formula;
        //console.log(formula);
        targetElement.attr('data-formula', formula);
        targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
    });
    $(`#built-roll`).contextmenu(async function(e){
        if (e.ctrlKey)
          console.log(Roll.parse($(this).attr('data-formula')));
        else {
          $(this).attr('data-formula', '');
          $(this).html(`<i class="fas fa-dice-d20"></i>`);
        }
    });
    let currentrollmode = game.settings.get("core", "rollMode");
    console.log(currentrollmode)
    $(`.${currentrollmode}`).click();
  },
  close:   html => {
    return}
},{ width: 400,  id:`inline-roll-dialog`, }).render(true);
  
  return true;
}
  
  
static async moreConvenientEffects(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  let list=`
<input type="text" id="myEffectsInput"  placeholder="Search for names.." style="margin-bottom:.5em;">
<div id="effectsUL" style="overflow-y:scroll;height:320px;" >
`;
for (const effect of game.dfreds.effects.all){
    list +=`<p>
            <a id="apply-effect-${effect.name}" name="${effect.name}">
             <img src="${effect.icon}" height="14" style="background: #333333; margin-right:.5em"/>${effect.name}</a></p>`;
    
}
list += `</div>`;
Dialog.persist({
  title: 'Convenient Effects' ,
  content:  list,
  render: (list) => {
       $("input#myEffectsInput").focus();
        
        $("a[id^=apply-effect-]").click(async function(){
            let effect = $(this).attr('name');
            //for (let t of canvas.tokens.controlled) {
            await game.dfreds.effectInterface.toggleEffect(effect, {uuids:canvas.tokens.controlled.map(t=>t.document.uuid)});
            for (let t of canvas.tokens.controlled) 
              if ([...Object.values(ui.windows)].map(w=>w.id).includes(t.actor.uuid.replace('.','_') + "-effects"))
                dnd5eByDialog.actorEffectsList(t.actor.uuid.replace('.','_'));
            
            //}
        });
        $("a[id^=apply-effect-]").contextmenu(async function(){
            let effectName = $(this).attr('name');
            let effect = game.dfreds.effects.all.filter(e=> e.name === effectName)[0]
            let messageContent = `<img src="${effect.icon}" style="border:unset; float:left; clear:both; margin-right: 5px;" width="32"/>
            ${effect.description}
            `;
            ChatMessage.create({
                flavor: effectName,
                content: messageContent,
                whisper: ChatMessage.getWhisperRecipients("GM")
            });
        });
        $("input#myEffectsInput").keyup(function(){
            var input, filter, ul, li, a, i, txtValue;
            input = document.getElementById('myEffectsInput');
            filter = input.value.toUpperCase();
            ul = document.getElementById("effectsUL");
            li = ul.getElementsByTagName('p'); 
            
            // Loop through all list items, and hide those who don't match the search query
            for (i = 0; i < li.length; i++) {
                a = li[i].getElementsByTagName("a")[0];
                txtValue = a.textContent || a.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    li[i].style.display = "";
                } else {
                    li[i].style.display = "none";
                }
            }
        });
  },
  buttons: {},
  close:   html => {
      return}
},{ height:400, width:250 , id: "df-effects-directory"}
);
  
  return true;
}
  
  
static async actorEffectsList(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  let {actorUuid, rollType, abilType, position, closeOnMouseLeave} = args[0] || {};
let t = '';
if (!token) token = _token;
if (!token && !actor) actor = game.user.character;
else actor = token.actor;
if (!actor) return ui.notifications.error("No Actor");
token = null
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
}
if (!actor) return ui.notifications.error("No Actor");
t = actor.uuid.replaceAll('.','_');
let w_id = `${t}-effects`;

let w = Object.values(ui.windows).find(w=>w.id===w_id);
if (w) position = w.position;
console.log(position)
let positionDefault =  
  {width: 350, id: w_id};
position = {...positionDefault, ...position, ...{height:'auto'}};

let closeTimeout = 1000;

let list=`

<div id="effectsUL" style="" >
`;
let activeEffects = [...actor.effects];
for (const effect of activeEffects){
        list += `<p id="${effect.id}">
                <img src="${effect.data.icon}" height="14" style="background: url(../ui/denim075.png) repeat;"/><span><a id="effect-name-${effect.id}" name="${effect.id}"> ${effect.data.label}</a> </span>
                <a id="effect-delete-${effect.id}" name="${effect.id}" style="float:right;"><i class="fa fa-times"></i></a>
                <a id="toggle-effect-${effect.id}" name="${effect.id}" style="float:right; margin-right: .4em;"><i class="fa fa-toggle-${effect.data.disabled?'off':'on'}"></i></a>
                </p>`;
}
list += `</div>`;
$(`#${w_id}`).remove()
if (w) w.close();
new Dialog({
  title: `${actor.name} - Active Effects`,
  content:  list,
  render: ()=>{
    //let header = `${actor.name} - Active Effects <a onclick="dnd5eByDialog.moreConvenientEffects()" style="float: right; ><i class="fa fa-plus"></i> Add</a>`;
    //$(`#${actor.uuid.replace('.','_')}-effects > header > h4`).html(header);
    
    if ($(`#${t}-effects-add`).length === 0)
    $(`#${t}-effects`).find('.window-title').after(`<a id="${t}-effects-add" onclick="dnd5eByDialog.moreConvenientEffects()" style="float: right; "><i class="fa fa-plus"></i> Add</a>`);
    
    if (closeOnMouseLeave) {
        $(`#${w_id}`).mouseenter(function(e){
          $(`#${w_id}`).removeClass('hide');
        });
        
        $(`#${w_id}`).mouseleave(async function(e){
          $(`#${w_id}`).addClass('hide');
          await new Promise((r) => setTimeout(r, closeTimeout));
          if ($(`#${w_id}`).hasClass('hide'))
            Object.values(ui.windows).filter(w=> w.id===w_id)[0].close();
        });  
      }
    
    $("input#myeffectInput").focus();
    $("a[id^=effect-name]").click(async function(e){
        let effect = actor.effects.get(this.name);
        effect.sheet.render(true);
    });
    
    $("a[id^=toggle-effect]").click(async function(){
        let effect = actor.effects.get(this.name);
        await effect.update({disabled:!effect.data.disabled})
        if (effect.data.disabled) {
          $(this).find('i').removeClass('fa-toggle-on')
          $(this).find('i').addClass('fa-toggle-off')
        } else {
          $(this).find('i').addClass('fa-toggle-on')
          $(this).find('i').removeClass('fa-toggle-off')
        }
    });
    
    $("a[id^=effect-delete]").click(async function(){
        let effect = actor.effects.get(this.name);
        await effect.delete();
        $(this).parent().remove();
    });
    
  },
  buttons: {},
  close:   html => {
      return}
}, position
).render(true);
//d.render(true);
  
  return true;
}
  
  
static async spellPreparation(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  if (args[0]) token = canvas.tokens.placeables.filter(t=>t.actor?.uuid===args[0].replaceAll('_','.'))[0];
if (!token) return;
token.control({releaseOthers:true});
let w_id = "spell-preparation";
let position =  {width: 930 , height: '100%', id: w_id};
let spells = token.actor.itemTypes.spell.sort((a, b)=> (a.data.data.level > b.data.data.level) ? 1 : (a.data.data.level === b.data.data.level) ? ((a.data.name > b.data.name) ? 1 : -1) : -1  );
let level = -1;
let list = `<div>`;//<div  style="display:grid; grid-template-columns: repeat(4, 200px)" >`;
let unprepared = 'rgba(150,150,150,.5) !important';
for (const spell of spells){
  if (spell.data.data.level !== level){
    level ++;
    if (level>=0) list +=`</div>`;
    list +=`<h2 style="margin-top: .2em">${level===0?'Cantrip':'Level '+level}</h2><div  style="display:grid; grid-template-columns: repeat(5, 180px)" >`;
  }
  let style = '';
  if (spell.data.data.preparation?.mode === 'prepared' && !spell.data.data.preparation.prepared) style = `color: ${unprepared}`;
  if (spell.data.data.level === 0) style = '';
  if (spell.data.data.preparation?.mode === 'innate') style = 'color: #8ff !important';//level = 'Innate';
  if (spell.data.data.preparation?.mode === 'pact') style = 'color: #fd3 !important';
  if (spell.data.data.preparation?.mode === 'always') style = 'color: #afa !important';
  list += `
  <div id="${spell.id}" style="white-space: nowrap; overflow: hidden;  text-overflow: ellipsis;">
  <img src="${spell.data.img}" height="14" style="background: url(../ui/denim075.png) repeat;"/>
  <span><a id="spell-name-${spell.id}" style="${style}" name="${spell.id}"> ${spell.data.name}</a> 
  </span></div>`;
}//<a id="spell-delete-${spell.id}" name="${spell.id}" style="float:right;"><i class="fa fa-times"></i></a>
list += `</div></div>`;
Dialog.persist({
  title: `${token.actor.name} Spells Prepared: `,
  content:  list,
  render: ()=>{
    let header = `${token.actor.name} Spells Prepared: 
    ${token.actor.itemTypes.spell.filter(spell=>spell.data.data.preparation.mode === 'prepared' && spell.data.data.preparation?.prepared).length}`;
    header += `<a title="Spell Sets" style="float: right" id="spell-sets-macro-button"><i class="fas fa-list"></i>&nbsp;Spell Sets</i></a>`;
    
    $(`#${w_id} > header > h4`).html(header);
    
    $(`#spell-sets-macro-button`).click(()=>{
      let w = Object.values(ui.windows).find(w=> w.id === `spell-sets`);
      if (w?.appId) w.bringToTop();
      else dnd5eByDialog.spellPreparationSets();
    });
    
    $("input#myspellInput").focus();
    
    $("a[id^=spell-name]").contextmenu(async function(e){
        let spell = token.actor.items.get(this.name);
        console.log(spell);
        spell.sheet.render(true);
    });
    $("a[id^=spell-name]").click(async function(){
      let spell = token.actor.items.get(this.name);
        if (spell.data.data.preparation.mode !== 'prepared') 
          return ui.notifications.warn(`${spell.data.name} is not a preparable spell`);
        await  spell.update({"data.preparation.prepared":!spell.data.data.preparation.prepared})
        console.log(spell.data.data.preparation.prepared, spell.data.data.preparation.mode) ;
        console.log($(this))
        if (spell.data.data.preparation.prepared) 
          $(this).attr('style', `color : unset'}`);
        else 
          $(this).attr('style', `color : ${unprepared}`);
        
        let header = `${token.actor.name} Spells Prepared: 
        ${token.actor.itemTypes.spell.filter(spell=>spell.data.data.preparation.mode === 'prepared' && spell.data.data.preparation?.prepared).length}`;
        header += `<a title="Spell Sets" style="float: right" id="spell-sets-macro-button"><i class="fas fa-list"></i>&nbsp;Spell Sets</i></a>`;
        $(`#${w_id} > header > h4`).html(header);
        
    });
    $("a[id^=spell-delete]").click(async function(){
        let spell = token.actor.spells.get(this.name);
        await spell.delete();
        $(this).parent().remove();
    }); 
    
  },
  buttons: {},
  close:   html => {
    let w = Object.values(ui.windows).find(w=> w.id === `spell-sets`);
      if (w?.appId) w.close();
      return;}
},position
);
//await d.render(true);
  
  return true;
}
  
  
static async spellPreparationSets(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  let w_id = `spell-sets`;
let position = Object.values(ui.windows).find(w=> w.id === `spell-sets`)?.position || { height:'100%', width: '100%' , id: `spell-sets`};
position["id"] = w_id;
let sets = token.actor.data.flags.world.SpellSets;
console.log(sets);
if (!sets) await token.actor.setFlag('world','SpellSets', [])
let content = `<input id="new-set-name" type="text" placeholder="new set name" style="width:150px"></input>&emsp;<a id="add-spell-set-button"><i class="fas fa-plus"></i></a><div id="spell-sets" style="display:grid; grid-template-columns: repeat(${sets.length}, 190px)">`;
for (let spellSet of sets){
  content += `<div style="width: 190px"><a class="spell-set" name="${spellSet.name}" onclick="console.log('${spellSet.name}')" style="font-size: 1.2em;">${spellSet.name}</a>`;
  for (let s_id of spellSet.spells) {
        let s = token.actor.items.get(s_id);
        content += `<li><img src="${s.data.img}" height="14" style="background: url(../ui/denim075.png) repeat;"/>
        <span> ${s.data.name}</span></li>`;
      }
  content += `</div>`;
}
content += '</div>';
let d = new Dialog({
  title: `${token.actor.name} Spell Sets` ,
  content,
  render: (app) => {
    
    $('.spell-set').click(async function() {
      let name = $(this).attr('name');
      let spellSet = token.actor.data.flags.world.SpellSets.find(s=>s.name===name);
      let updates = actor.itemTypes.spell.filter(s=>s.data.data.preparation.mode === 'prepared').map(s=> {return {_id:s.id, "data.preparation.prepared":spellSet.spells?.includes(s.id)}});
      console.log(updates)
      await actor.updateEmbeddedDocuments("Item", updates);
      dnd5eByDialog.spellPreparation();
      if (Object.values(ui.windows).find(w=> w.id === `spell-preparation`))
        dnd5eByDialog.spellPreparation(token.actor.uuid);
    });
    
    $('.spell-set').contextmenu(async function() {
      let name = $(this).attr('name');
      let del = await dialogYesNo(`Delete spell set named: ${name}?`)
      if (!del) return;
      let SpellSets = token.actor.data.flags.world.SpellSets;
      let foundIndex = SpellSets.findIndex(n=>n.name===name);
      if (foundIndex>-1) {
        SpellSets.splice(foundIndex, 1);
      }
      console.log(SpellSets);
      await actor.setFlag('world', 'SpellSets', SpellSets);
      dnd5eByDialog.spellPreparation();
    });
    
    $('#add-spell-set-button').click(async function(){
      let name = $(this).prev().val();
      if (!name) return;
      let preparedSpells = token.actor.itemTypes.spell.filter(s=>s.data.data.preparation.mode === 'prepared' && s.data.data.preparation.prepared).map(s=>s.id);
      let flag = token.actor.data.flags.world.SpellSets;
      flag.push({name, spells: preparedSpells});
      await actor.setFlag('world', 'SpellSets', flag);
      dnd5eByDialog.spellPreparation();
    });
  },
  buttons: {},
  close:   html => {
      return}
},position
).render(true);

async function dialogYesNo(prompt) {
  let response = await new Promise((resolve)=>{
      new Dialog({
       title: prompt,
       content:  '',
       buttons: {
         yes: { label : `Yes`, callback : () => { resolve(true); }},
         no:  { label : `No`,  callback : () => { resolve(false); }}
       },
       close:   html => { resolve(false); }
        },{}
      ).render(true);
  });
  return response;
}
  
  return true;
}
  
  
static async restDialog(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  //await this.setFlag('world','name', this.data.name);
//console.log(this.data.flags.world.name);
let {actorUuid, position, closeOnMouseLeave} = args[0] || {};
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
}
if (!actor) actor = character;
if (!actor) return;

let level = 0;
for (let [key, value] of Object.entries(actor.classes))
    level += value.data.data.levels;

let w_id = actor.uuid.replace('.','_')+'-rest-dialog';
let positionDefault = //width: `max(300, ${level*56})`  ,
  {  height: '100%' , id: w_id };
position = {...positionDefault, ...position};
//let closeOnMouseLeave = false;
//if (args[2]) closeOnMouseLeave = args[2];
let closeTimeout = 1000;

let hitDice = `
<style>
.hd.used {filter: drop-shadow(0px 0px 3px rgb(255 0 0 / 0.9));
  transition-property: filter;
 transition-duration: .4s; 
}
.hd.used:hover {filter: drop-shadow(0px 0px 4px rgb(255 0 0 / 0.9));}
.hd.unused {
filter: drop-shadow(0px 0px 2px rgb(255 255 255 / 0.9));
  transition-property: filter;
 transition-duration: .4s; 
}
.hd.unused:hover {
filter: drop-shadow(0px 0px 4px rgb(255 255 255 / 0.9));

}
</style><center>`;
let used = {};
for (let [key, value] of Object.entries(actor.classes))
  for (let i=0; i<value.data.data.levels; i++) 
    hitDice += `<img class="hd ${(i>=(value.data.data.levels-value.data.data.hitDiceUsed))?'used':'unused'}" data-d="${value.data.data.hitDice}" src="icons/dice/${value.data.data.hitDice}black.svg" width="48">`;
hitDice += `</center>`
Dialog.persist({
  title: `${actor.name} - Rest`,
  content: hitDice,
  render: (app) => {
    $(`.hd.unused`).click(function() {
      $(this).off('click').removeClass('unused').addClass('used');
      console.log(actor.rollHitDie($(this).attr('data-d'),{dialog: false}))
    });
    
    if (closeOnMouseLeave) {
      $(`#${w_id}`).mouseenter(function(e){
        $(`#${w_id}`).removeClass('hide');
      });
      
      $(`#${w_id}`).mouseleave(async function(e){
        $(`#${w_id}`).addClass('hide');
        await new Promise((r) => setTimeout(r, closeTimeout));
        if ($(`#${w_id}`).hasClass('hide'))
          Object.values(ui.windows).filter(w=> w.id===w_id)[0].close();
      });  
    }
  },
  buttons: { 
          shortRest: {
            icon: '<i class="fas fa-hourglass-half"></i>',
            label: 'Short Rest',
            callback: html => {
              actor.shortRest({dialog:false})
            }
          },
          longRest: {
            icon: '<i class="fas fa-bed"></i>',
            label: 'Long Rest',
            callback: html => {
              actor.longRest({dialog:true})
            }
          }
  },
  close:   html => {
      return}
},position
);//.render(true);
  
  return true;
}
  
  
static async rollDialog(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  let {actorUuid, rollType, abilType, position, closeOnMouseLeave} = args[0] || {};
let closeTimeout = 1000;
let t = '';

if (!token) token = _token;
if (!token && !actor) actor = game.user.character;
else actor = token.actor;
if (!actor) return ui.notifications.error("No Actor");;
token = null;
if (!actorUuid || !rollType || !abilType) return;
if (actorUuid) {
  if (actorUuid.includes('Token')) {
    token = await fromUuid(actorUuid);
    actor = token.actor;
  }
  else actor = await fromUuid(actorUuid)
}
t = actor.uuid.replaceAll('.','_');
console.log('t: ', t);
    
let bonus = '';
if (rollType === 'abilities' && abilType === 'save')
  bonus = 'save';
  if (rollType === 'abilities' && abilType === 'test')
  bonus = 'mod';
if (rollType === 'skills')
  bonus = 'total';
 
let roll = '';
if (rollType === 'abilities' && abilType === 'save')
  roll = `Ability${abilType.capitalize()}`;
if (rollType === 'abilities' && abilType === 'test')
  roll = `Ability${abilType.capitalize()}`;
if (rollType === 'skills')
  roll = `Skill`;
  
let left = 110;
let width = 330;
let w_id = `${t}-${roll}-dialog`;
let positionDefault =  
  {  width: width ,  left: left , id: w_id};
position = {...positionDefault, ...position};

let wTargets = [];

for (const [key, value] of Object.entries(actor.data.permission)) {
  if (key !== 'default' && value === 3)
    wTargets.push(game.users.get(key).name)
}
let whisperTargets = wTargets.join(', ')
console.log('?', actor.data.data[rollType]);
let content = `
<style>
  .my-inline-roll {
  background: #DDD;
  padding: 1px 4px;
  border: 1px solid #4b4a44;
  border-radius: 2px;
  white-space: nowrap;
  word-break: break-all;
  }
  .rms {
  font-size: 1.5em; border-bottom: 1px solid #782e22; margin-right:.1em;
  }
</style>
<div style="display:grid; grid-template-columns:1fr 1fr;">`;
for (const [key, value] of Object.entries(actor.data.data[rollType])){
  let text = CONFIG.DND5E[rollType][key] ;
  content += `<div align="left" style="margin-bottom:.75em;">${text}</div>
    <div align="left"> 
    [[/r 1d20 + ${value[bonus]} # ${text} ${abilType}]]
    <a id="inline-adv"  class="my-inline-roll" >ADV</a>
    <a id="inline-d20"  class="my-inline-roll" style="display:none"><i class="fas fa-dice-d20"></i></a>
    <a id="inline-dis"  class="my-inline-roll" >DIS</a>
    
    </div>`;
}
content += `</div>`;
let rollmodes = `<center>
<a id="${w_id}-rollmodeselectpr" name="publicroll" class="rms">&ensp;/pr&ensp;</span>
<a id="${w_id}-rollmodeselectgm" name="gmroll"     class="rms">&ensp;/gmr&ensp;</span>
<a id="${w_id}-rollmodeselectbr" name="blindroll"  class="rms">&ensp;/br&ensp;</span>
<a id="${w_id}-rollmodeselectsr" name="selfroll"   class="rms">&ensp;/sr&ensp;</span>
</center>`;
content = TextEditor.enrichHTML(content) ;
Dialog.persist({
    title : `${actor.data.name} ${rollType.capitalize()} ${abilType?abilType.capitalize():''}`, 
    content : content,
    render : (content) => {
      if (closeOnMouseLeave) {
        $(`#${w_id}`).mouseenter(function(e){
          $(`#${w_id}`).removeClass('hide');
        });
        
        $(`#${w_id}`).mouseleave(async function(e){
          $(`#${w_id}`).addClass('hide');
          await new Promise((r) => setTimeout(r, closeTimeout));
          if ($(`#${w_id}`).hasClass('hide'))
            Object.values(ui.windows).filter(w=> w.id===w_id)[0].close();
        });  
      }
      
      $(`[id$=${w_id}-straight-section-tab]`).css('textShadow' , "0 0 8px red");
      $(`#${w_id}-rollmodeselect-roll`).css('textShadow' , "0 0 8px red");
      $(`[id^=${w_id}-rollmodeselect]`).click(async function(e){
        let rollMode = $(this).attr('name');
        $('.rms').css('textShadow' , "unset");
        $(this).css('textShadow' , "0 0 8px red");
        game.settings.set("core", "rollMode", rollMode);
      });
      $(`a#inline-adv`).click(async function(e){
        let targetElement = $(this).prev();
        console.log(targetElement)
        let formulaArray = targetElement.attr('data-formula').split(' ');
        let numD20 = 2;
        if (e.shiftKey) 
          numD20 = 3;
        formulaArray.shift();
        formulaArray.unshift(numD20+'d20kh');
        let formula = formulaArray.join(' ');
        targetElement.attr('data-formula', formula);
        targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
        targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' with advantage');
        targetElement.click();
        $(this).next().click();
        targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' with advantage',''));
      });
      $(`a#inline-d20`).click(async function(e){
        let targetElement = $(this).prev().prev();
        let formulaArray = targetElement.attr('data-formula').split(' ');
        let numD20 = parseInt(formulaArray[0].split('d')[0]);
        formulaArray.shift();
        formulaArray.unshift('1d20');
        let formula = formulaArray.join(' ');
        targetElement.attr('data-formula', formula);
        targetElement.css('box-shadow','unset');
        targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
      });
      $(`a#inline-dis`).click(async function(e){
        let targetElement = $(this).prev().prev().prev();
        let formulaArray = targetElement.attr('data-formula').split(' ');
        formulaArray.shift();
        formulaArray.unshift('2d20kl');
        let formula = formulaArray.join(' ');
        targetElement.attr('data-formula', formula);
        targetElement.css('box-shadow','0 0 8px inset red');
        targetElement.html(`<i class="fas fa-dice-d20"></i> ${formula}`);
        targetElement.attr('data-flavor', targetElement.attr('data-flavor') + ' with disadvantage');
        targetElement.click();
        $(this).prev().click();
        targetElement.attr('data-flavor', targetElement.attr('data-flavor').replace(' with disadvantage',''));
      });
      $(`#${w_id}`).find(`section.window-content`).click(async function(e){
        console.log(this);
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
        
        for ( let w of Object.values(ui.windows).filter(w=> w.id !== `menu-${t}` && w.id.includes(`${t}`)))
          ui.windows[w.appId].bringToTop();
      });
    },
    buttons : {},
    close:   html => { 
      return;
    }
},position);//.render(true);
  
  return true;
}
  
  
static async characterDialogOnTurnHook(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  if (!Hooks._hooks.updateCombat || Hooks._hooks.updateCombat.findIndex(f=>f.toString().includes('CharacterDialogOnTurnHook'))<0) {
  Hooks.on(`updateCombat`, async (combat, changed, options, userId) => {
    //console.log(combat);
    // CharacterDialogOnTurnHook
    $(`div[id^=items-dialog-], div[id^=item-rolls-dialog-]`).hide();
    
    let combatantToken = canvas.tokens.get(combat.current.tokenId);
    combatantToken.control({releaseOthers: true});
    canvas.animatePan({x: combatantToken.data.x, y: combatantToken.data.y});
    
    let combatant_t = combat.combatant.actor.uuid.replaceAll('.','_');
    let combatantDialog = $(`div[id*=${combatant_t}]`);
    if (!combatantDialog.length) {
      game.macros.getName('Character Dialog').execute();
       dnd5eByDialog.characterDialog({
        actorUuid: combat.combatant.actor.uuid
        });
    }
    $(`div[id*=${combatant_t}]`).show();
  });
  ui.notifications.info('Character Dialog On Turn Hook Added');
} else {
  while (Hooks._hooks.updateCombat.findIndex(f=>f.toString().includes('CharacterDialogOnTurnHook'))>-1)
    Hooks._hooks.updateCombat.splice(Hooks._hooks.updateCombat.findIndex(f=>f.toString().includes('CharacterDialogOnTurnHook')), 1)
  ui.notifications.info('Character Dialog On Turn Hook Removed');
}
  
  return true;
}
  
  
static async customCSS(...args){
    if (!args[0]) args = [{}];
    let actor;
    let token = canvas.tokens.controlled[0];
    if (token) actor = token.actor;
    let character = game.user.character;
    
  if ($('#custom-css').length) return $('#custom-css').remove();
else
$('body').append(`<div id="custom-css" style="position: absolute; left: -1000;"><style>
#context-menu {
	z-index: 1000;
}
.chat-control-icon {
	display: none;	
}
img {
	border: none;
}
#chat-controls .roll-type-select {
	margin: 3.5px 1px 0px 1px;
	height: 20px;
}
/*
#chat-form > textarea{
  height: 10px;	
}*/
#chat-form  {
	height: 30px;	
	flex-basis: 50px;
}
#chat-message textarea {
	min-height: 20px; !important;	
}
#chat-controls > div > a.export-log {
	margin-left: 3.5px;
}
.jlnk__entity-link {
	color: rgba(30, 30, 30, 0.8) !important;
	background: #DDD;
}
.dialog > .window-content * {
    color: rgba(255, 255, 255, 1) ;
}
.dialog > section  {
    background: unset ;
	background: rgba(30,30,30,0.5)  !important;
	background-blend-mode: multiply ;
    ;
}
.dialog > section > div.dialog-content > *  {
    color: rgba(255, 255, 255, .9) ;
	background:  rgba(30, 30, 30 ,1); /*!important ;*/
	//background: unset ;
}
.dialog > section > div.dialog-content  * > option {
    color: rgba(255, 255, 255, .9) ;
	background:  rgba(00, 00, 00 ,1); /*!important ;*/
	//background: unset ;
}
.dialog-button {
    color: rgba(255, 255, 255, .9) ;
}
.dialog > section > div.dialog-content  {
    color: rgba(255, 255, 255, .9) ;
}
.dialog-content > * > button  {
    color: rgba(255, 255, 255, .9) ;
	background:  rgba(30, 30, 30 ,0);
}
.dialog-content > form > *  {
    color: rgba(255, 255, 255, .9) ;
	background: rgba(30, 30, 30 ,1) ;
}
.dialog-button {
    color: rgba(255, 255, 255, .9) ;
}
.dialog > section > div.dialog-content  * {
    color: rgba(255, 255, 255, .9) ;
	background: rgba(30, 30, 30 ,0) ;
}
.dialog > section > * > button  {
    color: rgba(255, 255, 255, .9) ;
	background: --dialog-background ;
}
.dialog > footer > button {
    color: rgba(255, 255, 255, .9) ;
}
.dialog .inline-roll {
	color: #000;
}
.section-tab {
    color: rgba(255, 255, 255, .9) ;
	background: unset ;
	background:  rgba(130, 130, 130 ,1) !important;
	
}
section > * > input {
    color: rgba(255, 255, 255, .9) ;
}
.tox > *  {
    //color: rgba(255, 255, 255, .9) ;
	background:  rgba(255, 255, 255 ,1) !important ;
	//background: unset ;
}
/*
#hotbar-page-controls > a:nth-child(1) {
	display: none
}
#hotbar-page-controls > a:nth-child(3) {
	display: none
}
#hotbar-page-controls > span {
	margin-top: 1em;  
}
*/
#hotbar #macro-list {
    border: 1px solid #FFFFFF00;
	    flex: 0 0 523px;
}
.flexrow .macro-list {
    border: 1px solid #FFFFFF00;
}
.hotbar-page .macro-list {
	flex: 0 0 523px;
}
#hotbar .macro.inactive {
    box-shadow: 0 0 0px #444 inset;
}
.hotbar-page {
	transition: unset;
    width: 630px;
	bottom: 52px;
}
#hotbar {
    width: 600px;
	border-radius: 5px;
	bottom: 1px;
}
#hotbar .macro {
	margin: 0px 1px 2px 1px;
	position: relative;
    height: 50px;
    border: 1px solid #000;
    border-radius: 3px;
    background:  url(../ui/denim075.png);
    box-shadow: 0 0 10px #000;
    cursor: pointer;
	
}
#macro-list{
	grid-column-gap:2px;	
}
#hotbar .bar-controls {
	height: 50px;
	margin: 1px 0px 0px 1px;
	flex: 0 0 32px;
    text-align: center;
    color: #c9c7b8;
    background: url(../ui/denim075.png);
    border: 1px solid #000;
    box-shadow: 0 0 0px #444 inset;
    border-radius: 3px;
}
</style></div>`)
$('#custom-css').hide();
  
  return true;
}
  

  
}

Hooks.on("controlToken", (token, selected)=>{
  if (!dnd5eByDialog.actorMenuOnControl) return;
  if (selected) dnd5eByDialog.actorMenu({actorUuid: token.actor.uuid});
});

Hooks.on(`ready`, async (...args) => { 
  dnd5eByDialog.customCSS();
});

Hooks.on("getSceneControlButtons",(controlButtons) => {
  if (game.user.isGM)
    controlButtons.find(b => b.layer === "tokens").tools.push(
        {
            name: "request-roll",
            title: "Request Roll",
            icon: "fas fa-dice-d20",
            button: true,
            onClick: async () => {
                dnd5eByDialog.whisperRequestInlineRoll()
            }
        }
    );
    controlButtons.find(b => b.layer === "tokens").tools.unshift(
        {
            name: "actor-menu",
            title: "Actor Menu",
            icon: "fas fa-list",
            toggle: false,
            onClick: toggled => {
              dnd5eByDialog.actorMenuOnControl = toggled;
            }
        }
    );
    controlButtons.find(b => b.layer === "tokens").tools.splice(3, 0,
        {
            name: "clear-targets",
            title: "Clear Targets",
            icon: "fas fa-remove-format",
            button: true,
            onClick: async () => {
                await game.user.updateTokenTargets([]);
            }
        }
    );
    //controlButtons.find(b => b.layer === "tokens").tools.find(t=>t.name==="target").icon = "fas fa-crosshairs";
});

Object.getPrototypeOf(Dialog).persist = function(data, options) {
  let w = Object.values(ui.windows).find(w=> w.id===options.id);
  let position = w?.position || {};
  options = {...options, ...position};
  new Dialog(data, options).render(true);
  if (w) w.bringToTop();
  return;
}

Hooks.on("renderSceneControls", ()=>{
if(!game.user.isGM) return;
$(".control-tools.main-controls").append(`    <li class="scene-control" id="chat-messages-dialog" title="Open Chat Messages Dialog">
        <i class="far fa-comments"></i>
    </li>`)
});

$(document).on("click", "#chat-messages-dialog", () => {
    dnd5eByDialog.chatMessagesDialog();
})