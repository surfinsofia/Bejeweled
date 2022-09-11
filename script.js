//add transitions

const c = document.getElementById("mycanvas");
const ctx=c.getContext("2d");
var pics = [
//green
"https://images-na.ssl-images-amazon.com/images/I/61jgNklmwmL._AC_SY355_.jpg",
//pink
"https://m.media-amazon.com/images/I/41HdsFe6F7L._AC_SX355_.jpg",
//blue
"https://cdn.shopify.com/s/files/1/2040/0303/products/Diamond_Beveled_Gemstone_Birthstone_Jewel_Cartoon_-_Blue_Topaz_521465848_grande.jpg?v=1534944589",
//yellow
"https://m.media-amazon.com/images/I/41U32arWktL._AC_SX355_.jpg",
//purple
"https://images-na.ssl-images-amazon.com/images/I/51GvRGIXnSL._AC_SX425_.jpg",
//red
"https://m.media-amazon.com/images/I/41v70wkmX+L._AC_SX355_.jpg",
//orange
"https://images-na.ssl-images-amazon.com/images/I/61eEyg-DXyL._AC_SY355_.jpg"];
var color = [
//green
'rgb(139,186,79)',
//red
'rgb(196,45,72)',
//pink
'rgb(208,107,160)',
//yellow
'rgb(255,204,102)',
//orange
'rgb(205,96,47)',
//blue
'rgb(106,157,213)',
//purple
'rgb(131,77,145)'
]
var grid ={
columns:8,
rows:8,
tilewidth:40,
tileheight:40,
tiles:[]
};
var choice1=undefined;
var choice2=undefined;
var horiz = [];
var vert = [];
var hints = [];
var score = 0;
var level = 1;
var goal = 100;//gonna double every level
var goalcounter = 0; //reset every level
var highscore = 0;

document.getElementById("new").onclick=function(){newGame()};
c.onload=newGame();

function newGame(){
ctx.font = "20px Russo One";
var worddim = ctx.measureText("Game Loading");
ctx.fillText("Game Loading",(grid.rows*grid.tileheight/2)-(worddim.width/2)+5,grid.rows*grid.tileheight/2);
document.body.style.backgroundColor=color[0];
document.getElementById("goal").style.color=color[0]
document.getElementById("progress").style.backgroundColor = color[0];
//reset
score=0;
level=1;
goal=100;
goalcounter=0;
grid.tiles = [];

//reset score bar
updateBar(0);

//update HTML
document.getElementById('goal').innerHTML= goal;
document.getElementById('highscore').innerHTML= "High Score: "+highscore;
document.getElementById("score").innerHTML = "Score: "+score;
document.getElementById("level").innerHTML = "Level: "+level;

//add event listeners and on clicks
c.addEventListener("mousedown",onMouseDown);
document.getElementById("quit").onclick=function(){
  gameOver();
};
document.getElementById("hint").onclick=function(){
  clearMarks();
  giveHint()
};

//initialize random jewels
for (var i=0;i<grid.columns;i++){
  let layer = [];
  for(var j=0;j<grid.rows;j++){
    layer.push({gem:Math.floor(Math.random()*pics.length),isMatch: false});
  }
  grid.tiles.push(layer);
}

//replace matches
findMatch();
goThroughAll(addNonRepeatingTiles);

//draw the gems to canvas
ctx.fillStyle = "white";
ctx.fillRect(0,0,c.width,c.height);
goThroughAll(drawGems);

}

//iterates through array of gems
function goThroughAll(func){
for (let i=0;i<grid.columns;i++){
  for(let j=0;j<grid.rows;j++){
    func(i,j)
  }
}
}

//draws the designated gem at the location i,j
function drawGems(i,j){
var image = new Image();
image.src = pics[grid.tiles[i][j].gem];
ctx.drawImage(image,j*grid.tileheight,i*grid.tilewidth, grid.tilewidth - 4, grid.tileheight -4);
}

function addRandomTile(i,j){
color1=color2=color3=color4=-1;

color1 = i<7?grid.tiles[i+1][j].gem:-1;
color2=j<7?grid.tiles[i][j+1].gem:-1;
color3 = i>0?grid.tiles[i-1][j].gem:-1;
color4=j>0?grid.tiles[i][j-1].gem:-1;

let possiblecolors = [0,1,2,3,4,5,6].filter(num=>num!==color1 && num!==color2 && num!==color3 && num!==color4);
grid.tiles[i][j].gem=randomitem(possiblecolors);
}

function randomitem(array){
return array[Math.floor(Math.random()*array.length)];
}

function addNonRepeatingTiles(i,j){

if (grid.tiles[i][j].isMatch===true){
  color1=color2=color3=color4=-1;

  color1 = i<7?grid.tiles[i+1][j].gem:-1;
  color2=j<7?grid.tiles[i][j+1].gem:-1;
  color3 = i>0?grid.tiles[i-1][j].gem:-1;
  color4=j>0?grid.tiles[i][j-1].gem:-1;

  let possiblecolors = [0,1,2,3,4,5,6].filter(num=>num!==color1 && num!==color2 && num!==color3 && num!==color4);
  grid.tiles[i][j].gem=randomitem(possiblecolors);
  grid.tiles[i][j].isMatch = false;
}
}

function drawMarks(x,y,color){
ctx.strokeStyle = color;
ctx.lineWidth=2;
ctx.strokeRect(x,y,40,40)
}

function clearMarks(){
for (let i=0;i<grid.columns;i++){
  for(let j=0;j<grid.rows;j++){
    drawMarks(i*grid.tilewidth,j*grid.tileheight,"white")
  }
}
}

function onMouseDown(e){

//find index of click
let pos = getClickPos(c,e);

//if choice1 undefined, add to choice1 and draw black border
if (choice1==undefined){
  drawMarks(pos.y*grid.tilewidth,pos.x*grid.tileheight,"black");
  choice1={x:pos.x,y:pos.y};
}
//if choice1 defined, add to choice2, draw red border and complete action
else{
  choice2={x:pos.x,y:pos.y};
  if (adjacentTiles(choice1.x,choice1.y,choice2.x,choice2.y)){
    swapTiles(choice1.x,choice1.y,choice2.x,choice2.y)
    findMatch();
    if (horiz.length>0||vert.length>0){
      adjustTiles();
    }
    else{
      //no matches so swap back
      swapTiles(choice1.x,choice1.y,choice2.x,choice2.y)
    }
  }

  clearMarks();
  goThroughAll(drawGems);
  choice1=undefined;
  choice2=undefined;
  findMatch();
  while(horiz.length>0||vert.length>0){
    adjustTiles();
    findMatch();
  }
  document.getElementById("score").innerHTML = "Score: "+score;
  goThroughAll(drawGems);
  doMovesExist();
  if (hints.length==0){
    gameOver();
  }
  if (goalcounter>=goal){
    updateBar(1);
    levelUp();
  }
  else{
    updateBar(goalcounter/goal)
  }
}
}

function getClickPos(c,e){
const rect = c.getBoundingClientRect();
return {
  y: Math.floor((e.clientX-rect.left)/(c.width/grid.columns)),
  x: Math.floor((e.clientY-rect.top)/(c.height/grid.rows))
};
}

function swapTiles(i,j,i2,j2){
let c1 = grid.tiles[i][j].gem;
let c2=grid.tiles[i2][j2].gem;
grid.tiles[i][j].gem=c2;
grid.tiles[i2][j2].gem=c1;
}

function findMatch(){
vert=[];
horiz=[];
var length = 0;
for (let i=0;i<grid.rows;i++){
  length = 1;
  for (let j=0;j<grid.columns;j++){
    checkmatch = false;
    if (j==grid.columns-1){
      checkmatch=true;
    }
    else{
      if (grid.tiles[i][j].gem==grid.tiles[i][j+1].gem&&grid.tiles[i][j].isMatch==false&&grid.tiles[i][j+1].isMatch==false){
        length++;
      }
      else{
        checkmatch=true;
      }
    }

    if (checkmatch){
      if (length>2){
        horiz.push({samedim:i,startdim:j-length+1,enddim:j,length: length});
        for (let h=j-length+1;h<=j;h++){
          grid.tiles[i][h].isMatch=true;
        }
      }
      length=1;
    }

  }
}

for (let j=0;j<grid.columns;j++){
  length = 1;
  for (let i=0;i<grid.rows;i++){
    checkmatch = false;
    if (i==grid.rows-1){
      checkmatch=true;
    }
    else{
      if (grid.tiles[i][j].gem==grid.tiles[i+1][j].gem&&grid.tiles[i][j].isMatch!==true&&grid.tiles[i+1][j].isMatch!==true){
        length++;
      }
      else{
        checkmatch=true;
      }
    }
    if (checkmatch){
      if (length>2){
        vert.push({samedim:j,startdim:i-length+1,enddim:i,length:length});
        for (let h=i-length+1;h<=i;h++){
          grid.tiles[h][j].isMatch=true;
        }
      }
      length=1;
    }
  }
}
}

function adjustTiles(){
if (vert.length>0){
  vert.forEach(function(cluster){
    for (let i=cluster.enddim;i>=0;i--){
      if (i-cluster.length>=0){
        grid.tiles[i][cluster.samedim].gem=grid.tiles[i-cluster.length][cluster.samedim].gem;
      }
      else{
        addRandomTile(i,cluster.samedim);
      }
      drawGems(i,cluster.samedim)
      grid.tiles[i][cluster.samedim].isMatch = false;
    }
    score+=cluster.length*10;
    goalcounter+=cluster.length*10;
  })
  vert=[];
}

if (horiz.length>0){
  horiz.forEach(function(cluster){
    for (let j=cluster.startdim;j<=cluster.enddim;j++){
      for (let i=cluster.samedim;i>=0;i--){
        if (i!=0){
          grid.tiles[i][j].gem=grid.tiles[i-1][j].gem
        }
        else{
          addRandomTile(i,j);
        }
        drawGems(i,j);
        grid.tiles[i][j].isMatch = false;
      }
    }
    score+=cluster.length*10;
    goalcounter+=cluster.length*10;
  })
  horiz=[];
}

goThroughAll(drawGems);
}

function adjacentTiles(x,y,x2,y2){
return (x==x2&&y==y2+1)||(x==x2&&y==y2-1)||(x==x2+1&&y==y2)||(x==x2-1&&y==y2);
}

function giveHint(){
let randnum= Math.floor(Math.random()*hints.length);
doMovesExist();

//horizontal
if (hints.length>0){
  if (hints[randnum].x==hints[randnum].x2){
    ctx.strokeStyle = "red";
    ctx.lineWidth=2;
    ctx.strokeRect(hints[randnum].y*grid.tilewidth,hints[randnum].x*grid.tileheight,80,40)
  }
  else{
    ctx.strokeStyle = "green";
    ctx.lineWidth=2;
    ctx.strokeRect(hints[randnum].y*grid.tilewidth,hints[randnum].x*grid.tileheight,40,80)
  }
}
}

function doMovesExist(){
hints = [];
for (let i=0;i<grid.columns;i++){
  for (let j=0;j<grid.rows-1;j++){
    swapTiles(i,j,i,j+1);
    if (doMatchesExist()){
      hints.push({x:i,y:j,x2:i,y2:j+1})
    }
    swapTiles(i,j,i,j+1)
  }
}

for (let j=0;j<grid.rows;j++){
  for (let i=0;i<grid.columns-1;i++){
    swapTiles(i,j,i+1,j);
    if(doMatchesExist()){
      hints.push({x:i,y:j,x2:i+1,y2:j})
    }
    swapTiles(i,j,i+1,j)
  }
}
}

function doMatchesExist(){
for (let i=0;i<grid.rows;i++){
  length = 1;
  for (let j=0;j<grid.columns;j++){
    checkmatch = false;
    if (j==grid.columns-1){
      checkmatch=true;
    }
    else{
      if (grid.tiles[i][j].gem==grid.tiles[i][j+1].gem){
        length++;
      }
      else{
        checkmatch=true;
      }
    }
    if (checkmatch){
      if (length>2){
        return true;
      }
      length=1;
    }
  }
}

for (let j=0;j<grid.columns;j++){
  length = 1;
  for (let i=0;i<grid.rows;i++){
    checkmatch = false;
    if (i==grid.rows-1){
      checkmatch=true;
    }
    else{
      if (grid.tiles[i][j].gem==grid.tiles[i+1][j].gem){
        length++;
      }
      else{
        checkmatch=true;
      }
    }
    if (checkmatch){
      if (length>2){
        return true;
      }
      length=1;
    }
  }
}
return false;
}

function gameOver(){
if (score>highscore){
  highscore=score;
}
c.removeEventListener("mousedown",onMouseDown);
document.getElementById("quit").onclick=null;
document.getElementById("hint").onclick=null;
ctx.fillStyle = "white";
ctx.fillRect(0,0,c.width,c.height);
goThroughAll(drawGems);

ctx.fillStyle = "rgba(0,0,0,0.7)";
ctx.fillRect(0,0,grid.rows*grid.tileheight,grid.columns*grid.tilewidth);

ctx.fillStyle = "red";

ctx.font = "20px Russo One";
var worddim = ctx.measureText("Level "+level);
ctx.fillText("Level "+level,(grid.rows*grid.tileheight/2)-(worddim.width/2),grid.rows*grid.tileheight/2-20);

ctx.font = "24px Russo One";
var worddim = ctx.measureText("Game Over!");
ctx.fillText("Game Over!",(grid.rows*grid.tileheight/2)-(worddim.width/2),grid.rows*grid.tileheight/2+10);

ctx.font = "20px Russo One";
var worddim = ctx.measureText("Score: "+score);
ctx.fillText("Score: "+score,(grid.rows*grid.tileheight/2)-(worddim.width/2),grid.rows*grid.tileheight/2+40);
}

function checkEnter(event){
if (event.keyCode===13&&goalcounter>=goal){
  nextLevel();
}
}

//shows level up screen and updates level
function levelUp(){
document.getElementById("hint").onclick=null;
c.removeEventListener("mousedown",onMouseDown);
level++;
document.getElementById("level").innerHTML = "Level: "+level;
document.addEventListener("keyup",checkEnter)

ctx.fillStyle = "rgba(0,0,0,0.7)";
ctx.fillRect(0,0,grid.rows*grid.tileheight,grid.columns*grid.tilewidth);

ctx.fillStyle = "#ffffff";
ctx.font = "24px Russo One";
var worddim = ctx.measureText("Level Up!");
ctx.fillText("Level Up!",(grid.rows*grid.tileheight/2)-(worddim.width/2)+5,grid.rows*grid.tileheight/2-30);

ctx.font = "20px Russo One";
var worddim = ctx.measureText("Level "+level);
ctx.fillText("Level "+level,(grid.rows*grid.tileheight/2)-(worddim.width/2)+5,grid.rows*grid.tileheight/2);

ctx.font = "15px Russo One";
var worddim = ctx.measureText("Press Enter to Continue");
ctx.fillText("Press Enter to Continue",(grid.rows*grid.tileheight/2)-(worddim.width/2)+5,grid.rows*grid.tileheight/2+30);

}

//after player accepts by clicking enter, changes goal and resets bar and goalcounter
function nextLevel(){
document.getElementById("hint").onclick=function(){
  clearMarks();
  giveHint()
};
ctx.fillStyle = "white";
ctx.fillRect(0,0,c.width,c.height);
goThroughAll(drawGems);
c.addEventListener("mousedown",onMouseDown);

goal*=2;
goalcounter=0;
document.getElementById('goal').innerHTML= goal;
updateBar(0);//go from 100 to 0
let randomnumber = (level%color.length)-1;
document.getElementById("progress").style.backgroundColor = color[randomnumber];
document.getElementById('goal').style.color=color[randomnumber];
document.body.style.backgroundColor=color[randomnumber];
}

//provide with start and end percents in DECIMAL form, updates bar
function updateBar(end){

var white = document.getElementById("bar");
var totalheight = 250;
let stepper = Number(white.style.height.slice(0,white.style.height.length-1));
var id=setInterval(frame,stepper>100-(end*100)?25:0.5);
function frame(){
  if (stepper==Math.floor(100-(end*100))){
    clearInterval(id)
  }
  else{
    stepper=stepper>100-(end*100)?stepper-1:stepper+1;
    white.style.height = stepper+'%';
  }
}
}
