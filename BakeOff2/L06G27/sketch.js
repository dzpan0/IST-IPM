// Bake-off #2 -- Seleção em UIs Densas
// IPM 2024-25, Período 3
// Entrega: até às 23h59, dois dias úteis antes do sétimo lab (via Fenix)
// Bake-off: durante os laboratórios da semana de 31 de Março

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER        = 27;      // Add your group number here as an integer (e.g., 2, 3)
const RECORD_TO_FIREBASE  = true;  // Set to 'true' to record user results to Firebase

// Pixel density and setup variables (DO NOT CHANGE!)
let PPI, PPCM;
const NUM_OF_TRIALS       = 12;     // The numbers of trials (i.e., target selections) to be completed
let continue_button;
let legendas;                       // The item list from the "legendas" CSV

// Metrics (DO NOT CHANGE!)
let testStartTime, testEndTime;     // time between the start and end of one attempt (8 trials)
let hits 			      = 0;      // number of successful selections
let misses 			      = 0;      // number of missed selections (used to calculate accuracy)
let database;                       // Firebase DB  

// Study control parameters (DO NOT CHANGE!)
let draw_targets          = false;  // used to control what to show in draw()
let trials;                         // contains the order of targets that activate in the test
let current_trial         = 0;      // the current trial number (indexes into trials array above)
let attempt               = 0;      // users complete each test twice to account for practice (attemps 0 and 1)

// Target list/colours/groups, group sizes and layout variables
let targets               = [];
let group_targets = {};
let group_sizes = [];
let group_list = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'Y'];
let colour_map = {};
const GRID_ROWS           = 3; 
const GRID_COLUMNS        = 7;

// Sound variables
let hit_sound;
let miss_sound;

// Ensures important data is loaded before the program starts
function preload()
{
  // id,name,...
  legendas = loadTable('legendas/G_'+GROUP_NUMBER+'.csv', 'csv', 'header');
  hit_sound = loadSound('./sound_fx/hit.mp3');
  miss_sound = loadSound('./sound_fx/miss.mp3');
}

// Runs once at the start
function setup()
{
  createCanvas(700, 500);    // window size in px before we go into fullScreen()
  frameRate(60);             // frame rate (DO NOT CHANGE!)

  colour_map = //(r,g,b,default_brightness)
  {
    A:[255, 191, 0],
    B:[0, 0, 255],
    C:[0, 180, 180],
    D:[21, 96, 189],
    F:[255, 220, 130],
    G:[0, 200, 15],
    H:[218, 145, 0],
    I:[100, 0, 130],
    J:[0, 168, 107],
    K:[195, 176, 145],
    L:[230, 230, 250],
    M:[255,20,147],
    N:[200, 115, 0],
    O:[255, 140, 0],
    P:[200,50,255],
    R:[255, 0, 0],
    S:[192, 192, 192],
    T:[0, 128, 128],
    U:[18, 10, 143],
    V:[238, 130, 238],
    W:[119, 63, 26],
    Y:[180, 180, 0]
  }

  group_targets = 
  {
    A:[],
    B:[],
    C:[],
    D:[],
    F:[],
    G:[],
    H:[],
    I:[],
    J:[],
    K:[],
    L:[],
    M:[],
    N:[],
    O:[],
    P:[],
    R:[],
    S:[],
    T:[],
    U:[],
    V:[],
    W:[],
    Y:[]
  }
  
  randomizeTrials();         // randomize the trial order at the start of execution
  drawUserIDScreen();        // draws the user start-up screen (student ID and display size)
  drawInformation();         // draws the information text
}

// Runs every frame and redraws the screen
function draw()
{
  if (draw_targets && attempt < 2)
  {     
    // The user is interacting with the 6x3 target grid
    background(color(0,0,0));        // sets background to black
    
    // Print trial count at the top left-corner of the canvas
    textFont("Arial", 16);
    fill(color(25,255,255));
    textAlign(LEFT);
    text("Trial " + (current_trial + 1) + " of " + trials.length, 50, 20);
    
    // Draws the target label to be selected in the current trial. We include 
    // a black rectangle behind the trial label for optimal contrast in case 
    // you change the background colour of the sketch (DO NOT CHANGE THESE!)
    fill(color(0,0,0));
    rect(0, height - 40, width, 40);
 
    textFont("Arial", 20); 
    fill(color(255,255,255)); 
    textAlign(CENTER); 
    text(legendas.getString(trials[current_trial],1), width/2, height - 20);
    
    // Draw all targets
	for (var i = 0; i < legendas.getRowCount(); i++) targets[i].draw();
  }
}

// Print and save results at the end of 12 trials
function printAndSavePerformance()
{
  // DO NOT CHANGE THESE! 
  let accuracy			= parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time         = (testEndTime - testStartTime) / 1000;
  let time_per_target   = nf((test_time) / parseFloat(hits + misses), 0, 3);
  let penalty           = constrain((((parseFloat(95) - (parseFloat(hits * 100) / parseFloat(hits + misses))) * 0.2)), 0, 100);
  let target_w_penalty	= nf(((test_time) / parseFloat(hits + misses) + penalty), 0, 3);
  let timestamp         = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  textFont("Arial", 18);
  background(color(0,0,0));   // clears screen
  fill(color(255,255,255));   // set text fill color to white
  textAlign(LEFT);
  text(timestamp, 10, 20);    // display time on screen (top-left corner)
  
  textAlign(CENTER);
  text("Attempt " + (attempt + 1) + " out of 2 completed!", width/2, 60); 
  text("Hits: " + hits, width/2, 100);
  text("Misses: " + misses, width/2, 120);
  text("Accuracy: " + accuracy + "%", width/2, 140);
  text("Total time taken: " + test_time + "s", width/2, 160);
  text("Average time per target: " + time_per_target + "s", width/2, 180);
  text("Average time for each target (+ penalty): " + target_w_penalty + "s", width/2, 220);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = 
  {
        project_from:       GROUP_NUMBER,
        assessed_by:        student_ID,
        test_completed_by:  timestamp,
        attempt:            attempt,
        hits:               hits,
        misses:             misses,
        accuracy:           accuracy,
        attempt_duration:   test_time,
        time_per_target:    time_per_target,
        target_w_penalty:   target_w_penalty,
  }
  
  // Sends data to DB (DO NOT CHANGE!)
  if (RECORD_TO_FIREBASE)
  {
    // Access the Firebase DB
    if (attempt === 0)
    {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }
    
    // Adds user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() 
{
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)
  if (draw_targets)
  {
    for (var i = 0; i < legendas.getRowCount(); i++)
    {
      // Check if the user clicked over one of the targets
      if (targets[i].clicked(mouseX, mouseY)) 
      {
        // Checks if it was the correct target
        if (targets[i].id === trials[current_trial] + 1) {
          hits++;
          targets[i].hasAppeared();
          hit_sound.setVolume(0.3);
          hit_sound.play();
        } 
        else {
          misses++;
          miss_sound.setVolume(0.6);
          miss_sound.play();
        }
        
        current_trial++;              // Move on to the next trial/target
        break;
      }
    }
    
    // Check if the user has completed all trials
    if (current_trial === NUM_OF_TRIALS)
    {
      testEndTime = millis();
      draw_targets = false;          // Stop showing targets and the user performance results
      printAndSavePerformance();     // Print the user's results on-screen and send these to the DB
      attempt++;                      
      
      // If there's an attempt to go create a button to start this
      if (attempt < 2)
      {
        continue_button = createButton('START 2ND ATTEMPT');
        continue_button.mouseReleased(continueTest);
        continue_button.position(width/2 - continue_button.size().width/2, height/2 - continue_button.size().height/2);
      }
    }
    // Check if this was the first selection in an attempt
    else if (current_trial === 1) testStartTime = millis(); 
  }
}

// Evoked after the user starts its second (and last) attempt
function continueTest()
{
  // Re-randomize the trial order
  randomizeTrials();
  
  // Resets performance variables
  hits = 0;
  misses = 0;
  
  current_trial = 0;
  continue_button.remove();

  for (var i = 0; i < 80; i++) {
    targets[i].reset();
  }
  
  // Shows the targets again
  draw_targets = true; 
}

// Creates and positions the UI targets
function createTargets(target_size)
{
  let aux_targets = [];
  
  // Set targets in a 8 x 10 grid
  for (let r = 0; r < 8; r++)
  {
    for (let c = 0; c < 10; c++)
    {
      // Find the appropriate label and ID for this target
      let legendas_index = c + 10 * r;
      let target_id = legendas.getNum(legendas_index, 0);  
      let target_label = legendas.getString(legendas_index, 1);

      let curr_target = [target_id, target_label];
      aux_targets.push(curr_target);
    }
  }

  aux_targets.sort((x, y) => x[1].localeCompare(y[1]), 'en', { sensitivity: 'base' });

  for (var i = 0; i < 80; i++) {
    let colour = colour_map[aux_targets[i][1][0]] ?? [155, 155, 155];
    let target = new Target(target_size, aux_targets[i][1], aux_targets[i][0], colour);
    targets.push(target);
    group_targets[target.label[0]].push(target);
  }
}

function calculateGroupPositions(target_size, screen_width, screen_height, vertical_gap)
{
  // Calculates the size of each group
  for (let letter in group_targets) {
    let n_cols = ceil(group_targets[letter].length / 3);
    let width = n_cols * (target_size * 1.25) + (n_cols + 1) / 6;
    let n_rows = group_targets[letter].length;

    if (group_targets[letter].length >= 3)
      n_rows = 3;

    let size = [n_cols, width, n_rows];
    group_sizes.push(size);
  }

  let v_margin = vertical_gap / (GRID_ROWS - 1);
  let group_height = 0;

  if (display_size < 15) {
    group_height = (3 * target_size + 0.8) * PPCM;
  }
  else {
    group_height = (3 * target_size + 0.4) * PPCM;
  }

  let group_y = screen_height * PPCM - group_height * 4;
 
  for (let r = 0; r < GRID_ROWS; r++) {
    let width = 0;
    let n_groups = GRID_COLUMNS;
    group_y = group_y - 5 + group_height;

    if (r === 1) {
      n_groups++;

      for (let c = 0; c < GRID_COLUMNS + 1; c++)
        width += group_sizes[c + GRID_COLUMNS * r][1];
    }
    else {
      for (let c = 0; c < GRID_COLUMNS; c++) {
        if (r === 2)
          width += group_sizes[c + 1 + GRID_COLUMNS * r][1];
        else
          width += group_sizes[c + GRID_COLUMNS * r][1];
      }
    }

    let h_margin = ((screen_width - width)/2 * PPCM - 20) / (n_groups - 1);

    width = 0;

    for (let col = 0; col < n_groups; col++) {
      let group_x = display_size ** 1.65 + h_margin * col + width;

      if (display_size >= 45)
        group_x = display_size ** 1.5 + h_margin * col + width;
      else if (display_size >= 30)
        group_x = display_size ** 1.55 + h_margin * col + width;

      if (display_size == 13) {
        group_x = 20 + h_margin * col + width;
      }

      if (display_size < 15)
        group_y = 40 + (v_margin + group_height) * r;
    
      if (r === 2) {
        width += group_sizes[col + 1 + GRID_COLUMNS * r][1] * PPCM;
        let letter = group_list[[col + 1 + GRID_COLUMNS * r]];
        calculateTargetPositions(group_targets[letter], target_size, group_x, group_y);
      }
      else {
        width += group_sizes[col + GRID_COLUMNS * r][1] * PPCM;
        let letter = group_list[[col + GRID_COLUMNS * r]];
        calculateTargetPositions(group_targets[letter], target_size, group_x, group_y);
      }
    }
  }
}

function calculateTargetPositions(targets, target_size, x, y) {
  let row = 0;
  let col = 0;
  let letter = targets[0].label[0];
  let gap = PPCM / 15;

  for (let i = 0; i < targets.length; i++) {
    let target_x = x + gap + (gap + (target_size * 1.25) * PPCM) * col + ((target_size * 1.25) * PPCM) / 2;
    let target_y = y + gap + (gap + target_size * PPCM) * row + (target_size * PPCM) / 2;

    col++;
    let ind = group_list.indexOf(letter);
    
    if (col === group_sizes[ind][0]) {
      row++;
      col = 0;
    } 
    

    targets[i].setPosition(target_x, target_y);
  }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() 
{
  if (fullscreen())
  {
    resizeCanvas(windowWidth, windowHeight);
    
    // DO NOT CHANGE THE NEXT THREE LINES!
    let display        = new Display({ diagonal: display_size }, window.screen);
    PPI                = display.ppi;                      // calculates pixels per inch
    PPCM               = PPI / 2.54;                       // calculates pixels per cm
  
    // Make your decisions in 'cm', so that targets have the same size for all participants
    // Below we find out out white space we can have between 2 cm targets
    let screen_width   = display.width * 2.54;             // screen width
    let screen_height  = display.height * 2.54;            // screen height
    let target_size    = 1.65;                                // sets the target size (will be converted to cm when passed to createTargets)
    let vertical_gap   = (screen_height - (3 * target_size + 0.5) * GRID_ROWS);  // empty space in cm across the y-axis (based on 8 targets per column)

    
    // Creates and positions the UI targets according to the white space defined above (in cm!)
    // 80 represent some margins around the display (e.g., for text)
    createTargets(target_size * PPCM);

    calculateGroupPositions(target_size, screen_width, screen_height, vertical_gap * PPCM - 80);

    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;
  }
}