/*
    Design Tool and Simulator Implementation

    Developed by Sam Tebbet
 */

// Variables for the simulator
let currentStepState = '';
let stepIteration = 0;
let console_text = "";
print_to_console("", "init");

$(document).on('click', '.sim-submit', function () {
    // Run button for the simulator
    add_inputs(document.getElementById('sim-inputs').value, false)
});
$(document).on('click', '.sim-step', function () {
    // Step button for the simulator
    add_inputs(document.getElementById('sim-inputs').value, true)
});

function copy_button() {
    // Copy the text inside the output field
    navigator.clipboard.writeText(document.getElementById("sim-output").value);
    document.getElementById('copybtn').setAttribute('class', "btn btn-outline-success");
    setTimeout('$("#copybtn").removeClass("btn-outline-success").addClass("btn-outline-warning");', 2000);

}

$("textarea").on('click', function () {
    // Click event handler for copying the text inside the console
    navigator.clipboard.writeText(document.getElementById("console").value);
    document.getSelection().removeAllRanges();
    document.getElementById('console').setAttribute('style', "border: 1px solid #28a743");
    setTimeout('document.getElementById("console").setAttribute("style", "border: 1px solid grey;") ', 2000);
});


$(document).on('click', '.sim-reset', function () {
    // Reset the simulator
    currentStepState = '';
    stepIteration = 0;
    console_text = '';
    set_sim_output('');
    update_sim_text('');
    print_to_console("", "init");
    deselect();
});


document.getElementById('sim-inputs').addEventListener('keyup', function (e) {
    // Check for special characters in the simulator input
    this.value = specialCharacter(this.value);
});


function add_inputs(inputs, stepping) {
    // Called when there are new inputs to the simulator

    inputs = inputs.split(',');

    if (!stepping) {
        stepIteration = 0;
    }
    if (stepIteration === 0) {
        console_text = "";
        set_sim_output("");
    }

    if (!check_inputs(inputs)) {
        // Validate the machine and the inputs to the simulator
        print_to_console("Simulation Stopping");

    } else {
        if (stepping) {
            // When the step button is pressed
            if (document.getElementById('mealy-machine').checked) {
                step_through_mealy_moore(inputs, false);
            } else if (document.getElementById('moore-machine').checked) {
                step_through_mealy_moore(inputs, true);
            } else {
                step_through(inputs);
            }
        } else {
            // Iterating through all of the inputs
            stepIteration = 0;
            set_sim_output("");
            if (document.getElementById('mealy-machine').checked) {
                run_mealy_moore(inputs, false);
            } else if (document.getElementById('moore-machine').checked) {
                run_mealy_moore(inputs, true);
            } else {
                simulate(inputs);
            }
        }
    }
}

function step_through_mealy_moore(inputs, moore) {
    // Function hanlding stepping through inputs for Mealy and Moore machines
    function checkOutput(inputs) {
        // Check if the machine has finished
        if (stepIteration > inputs.length - 1 && currentStepState !== null) {
            print_to_console("Simulation Finished");
            print_to_console(`Output: ${document.getElementById('sim-output').value}`);
        }
    }

    if (stepIteration > inputs.length - 1) {
        checkOutput(inputs);
    } else if (stepIteration === 0) {
        // First iteration of the machine looks for the initial state
        for (const [_, value] of Object.entries(stateDict)) {
            if (value.initialState) {
                currentStepState = {'currentState': value.text.text(), 'output': '0'};
            }
        }
        if (moore) {
            currentStepState = step_moore(currentStepState.currentState, inputs[stepIteration++]);
        } else {
            currentStepState = step_mealy(currentStepState.currentState, inputs[stepIteration++]);
        }
        checkOutput(inputs);


    } else {
        // Process of simulating a transition in the machine
        if (moore) {
            currentStepState = step_moore(currentStepState.currentState, inputs[stepIteration++]);
        } else {
            currentStepState = step_mealy(currentStepState.currentState, inputs[stepIteration++]);
        }
        checkOutput(inputs);


    }


}

function step_mealy(currentState, input) {
    // Function for simulating a transition in a Mealy machine

    let stateTable = generate_mealy_state_table();
    let nextState = '';
    let output = '';
    let transitioned = false;

    for (let i of stateTable) {
        if (i.startState === currentState && i.transition === input) {
            print_to_console(`${input} | ${i.output}: ${currentState} --> ${i.nextState}`);
            nextState = i.nextState;
            output = i.output;
            update_sim_text(nextState);

            if (document.getElementById('sim-output').value !== '') {
                set_sim_output(`${document.getElementById('sim-output').value},${output}`);
            } else {
                set_sim_output(`${output}`);
            }

            transitioned = true;
            break;
        }
    }
    if (!transitioned) {
        print_to_console(`Transition not found: ${currentState} - ${input} -> __`);
        return null;
    }
    select_machine(nextState, currentState);
    return {'currentState': nextState, 'output': output};
}

function step_moore(currentState, input) {
    // Funcction for simulating a transtition in a Moore machine

    let stateTable = generate_moore_state_table();
    let nextState = '';
    let output = '';
    let transitioned = false;

    for (let i of stateTable) {
        if (i.startState === currentState && i.transition === input) {
            print_to_console(`${input} | ${i.output} : ${currentState} --> ${i.nextState}  `);
            nextState = i.nextState;
            output = i.output;
            update_sim_text(nextState);
            if (document.getElementById('sim-output').value !== '') {
                set_sim_output(`${document.getElementById('sim-output').value},${output}`);
            } else {
                set_sim_output(`${output}`);
            }
            transitioned = true;
            break;
        }
    }
    if (!transitioned) {
        print_to_console(`Transition not found: ${currentState} - ${input} -> __`);
        return null;
    }

    select_machine(nextState, currentState);
    return {'currentState': nextState, 'output': output};
}


function run_mealy_moore(inputs, moore) {
    // Function for simulating all the inputs to Mealy and Moore Machines

    let initialState = "";
    for (const [_, value] of Object.entries(stateDict)) {
        if (value.initialState) {
            initialState = value.text.text()
        }
    }

    let currentState = {'currentState': initialState, 'output': '0'};

    // Iterate through the inputs
    for (let i of inputs) {
        let prevState = currentState.currentState;
        if (moore) {
            currentState = step_moore(currentState.currentState, i);
        } else {
            currentState = step_mealy(currentState.currentState, i);
        }

        if (currentState === null) {
            print_to_console(`Transition not found: ${prevState} - ${i} -> __`);
            break;
        }
    }

    if (currentStepState !== null) {
        print_to_console("Simulation Finished");
        print_to_console(`Output: ${document.getElementById('sim-output').value}`);
    }

}

function step_through(inputs) {
    // Function that handles stepping through the inputs for a Deterministic Finite Automata
    function checkOutput(inputs) {
        // Checks if the simulation has finished
        if (stepIteration > inputs.length - 1 && currentStepState !== null) {
            print_to_console("Simulation Finished");

            // Checks that the current state is an accepting state
            for (const [_, value] of Object.entries(stateDict)) {
                if (currentStepState === value.text.text()) {
                    if (value.finalState) {
                        set_sim_output("True");
                        print_to_console("Machine Returns True");
                    } else {
                        set_sim_output("False");
                        print_to_console("Machine Returns False");
                    }
                }
            }
        }
    }

    if (stepIteration > inputs.length - 1) {
        checkOutput(inputs);
    } else if (stepIteration === 0) {
        // Looks for an initial state
        for (const [_, value] of Object.entries(stateDict)) {
            if (value.initialState) {
                currentStepState = value.text.text();
            }
        }
        currentStepState = step(currentStepState, inputs[stepIteration++]);
        checkOutput(inputs)
    } else {
        // Process of simulating a transition
        currentStepState = step(currentStepState, inputs[stepIteration++]);
        checkOutput(inputs);
    }


}

function set_sim_output(o) {
    // Function for setting the output text
    document.getElementById('sim-output').value = o;
}

function select_machine(currentState, prevState) {
    // Function for visualising the transition on the drawn diagram

    // Changes the new state to orange
    for (const [_, value] of Object.entries(stateDict)) {
        if (value.text.text() === currentState) {
            value.state.stroke('orange');
            if (value.finalState) {
                value.innerCircle.stroke('orange');
            }
        }
    }

    // Changes the transition just parsed to orange
    for (const [_, value] of Object.entries(transitionDict)) {
        if (currentState === stateDict[`state${value.endState.id()}`].text.text() && prevState === stateDict[`state${value.startState.id()}`].text.text()) {
            value.transition.stroke('orange');
            value.transition.fill('orange');
        }
    }
}

function generate_state_table() {
    // Generates a state table for Deterministic Finite Automata

    let stateTable = []
    for (const [_, value] of Object.entries(transitionDict)) {
        stateTable.push({
            'startState': stateDict[`state${value.startState.id()}`].text.text(),
            'transition': value.text.text(),
            'nextState': stateDict[`state${value.endState.id()}`].text.text()
        });
    }

    return stateTable;
}

function generate_mealy_state_table() {
    // Generates a state table for the Mealy machines

    let stateTable = []
    for (const [_, value] of Object.entries(transitionDict)) {
        stateTable.push({
            'startState': stateDict[`state${value.startState.id()}`].text.text(),
            'transition': value.text.text(),
            'output': value.text2.text(),
            'nextState': stateDict[`state${value.endState.id()}`].text.text()
        });
    }

    return stateTable;
}

function generate_moore_state_table() {
    // Generates a state table for the Moore machines

    let stateTable = []
    for (const [_, value] of Object.entries(transitionDict)) {
        stateTable.push({
            'startState': stateDict[`state${value.startState.id()}`].text.text(),
            'transition': value.text.text(),
            'output': stateDict[`state${value.endState.id()}`].text2.text(),
            'nextState': stateDict[`state${value.endState.id()}`].text.text()
        });
    }

    return stateTable;
}

function simulate(inputs) {
    /*
    Function to run all the inputs at once for Discrete Finite Automata
     */

    // Finds the Initial State
    let initialState = "";
    for (const [_, value] of Object.entries(stateDict)) {
        if (value.initialState) {
            initialState = value.text.text()
        }
    }

    let currentState = initialState;

    let transitioned = false;
    // Simulating the inputs
    for (let i of inputs) {
        // Step through an Input and change the current state
        currentState = step(currentState, i);

        // If no transition was found
        if (currentState === null) {
            transitioned = false;
            break;
        }
        transitioned = true;
    }

    // Outputs to the simulator
    if (transitioned) {
        for (const [_, value] of Object.entries(stateDict)) {
            if (currentState === value.text.text()) {
                if (value.finalState) {
                    set_sim_output("True");
                    print_to_console("Machine Returns True");
                } else {
                    set_sim_output("False");
                    print_to_console("Machine Returns False");
                }
            }
        }
    }

}


function step(currentState, input) {
    /*
    Step function for Discrete Finite Automata
     */

    let stateTable = generate_state_table(); // Generate a state table to lookup
    var nextState;
    let transitioned = false;

    // Find the transition with the current state and the input
    for (let i of stateTable) {
        if (i.startState === currentState && i.transition === input) {
            print_to_console(`${input}: ${currentState} --> ${i.nextState}`);
            nextState = i.nextState;
            update_sim_text(nextState);
            transitioned = true;
            break;
        }
    }

    // If no transition was found return an Error
    if (!transitioned) {
        print_to_console(`Transition not found: ${currentState} - ${input} -> __`);
        set_sim_output("Error");
        return null;
    }

    // Show the transition on the user diagram
    select_machine(nextState, currentState);
    return nextState;
}

function print_to_console(string, type = "") {
    // Function prints to the console.

    console_area = document.getElementById("console")
    if (type !== "init") {
        // Reset the text in the console if the type is "init"
        console_text += string + '\n';
    }
    console_area.value = console_text;
}


function check_inputs(inputs) {
    /*
    Check the inputs to ensure the simulation can run
     */

    // All the values in the transitions
    let all_values = []
    for (const [_, value] of Object.entries(transitionDict)) {
        all_values.push(value.text.text());
    }

    // Checks if there is a value in inputs that is not in the accepted values
    function accept(v) {
        return all_values.indexOf(v) > -1;
    }

    for (let i of inputs) {
        if (!accept(i)) {
            print_to_console("Invalid input(s)");
            return false
        }
    }
    if (stepIteration === 0) {
        print_to_console("Accepted input(s)");
    }

    // Check if there is an initial and an end state
    let init_detected = false;
    let end_detected = false;
    for (const [_, value] of Object.entries(stateDict)) {

        if (value.initialState) {
            if (stepIteration === 0) {
                print_to_console(`Initial State ${value.text.text()} detected`)
            }
            init_detected = true;
        }
        if (value.finalState) {
            end_detected = true;
        }

    }
    if (!init_detected) {
        print_to_console(`Initial State not detected`);
        return false;
    }
    if (document.getElementById('default-machine').checked) {
        if (!end_detected) {
            print_to_console(`Accepting State not detected`);
            print_to_console(`... continuing anyway`);
        }
    }


    // Check states don't have 2 transitions of the same value
    let stateTable = generate_state_table();
    let seen = []
    seen.push({
        'startState': '',
        'transition': '',
        'nextState': ''
    });

    for (let i of stateTable) {
        for (let j of seen) {
            if (i.startState === j.startState && i.transition === j.transition) {
                print_to_console(`Duplicate transition ${i.transition} for state ${i.startState}`);
                return false;
            }
        }
        seen.push(i);
    }

    // Check that 2 states do not have the same name
    seen = [];
    for (const [_, value] of Object.entries(stateDict)) {
        if (seen.includes(value.text.text())) {
            print_to_console(`Duplicate states ${value.text.text()}`);
            return false;
        }
        seen.push(value.text.text());
    }

    // Only if all the checks have passed can you return true
    return true

}

/*
Konva implementation for the current state visualisation in the simulator tab
 */

let sim_width = 316
let sim_height = 160

var sim_stage = new Konva.Stage({
    container: 'sim-container',
    width: sim_width,
    height: sim_height,
    draggable: false
})

var sim_layer = new Konva.Layer();

let currentState = new Konva.Circle({
    x: sim_stage.width() / 2,
    y: sim_stage.height() / 2,
    radius: 60,
    stroke: 'orange',
    strokeWidth: 3,
    draggable: false,
});

let stateText = new Konva.Text({
    x: sim_stage.width() / 2,
    y: sim_stage.height() / 2,
    fill: 'white',
    fontSize: 25,
})

function update_sim_text(t) {
    // Updates the text inside the state
    stateText.text(t);
    stateText.offset({
        x: stateText.width() / 2,
        y: stateText.height() / 2
    });

    deselect();
}

sim_layer.add(currentState, stateText);
sim_stage.add(sim_layer);

/*
END OF THE SIMULATOR
 */

$('#sidebar-list a').on('click', function (e) {
    e.preventDefault()
    $(this).tab('show')
})

// Gets the width of container for the canvas size
let width = document.getElementsByClassName('canvas-container').item(0).clientWidth;
let height = document.getElementsByClassName('canvas-container').item(0).clientHeight;

// stage
var stage = new Konva.Stage({container: 'container', width: width, height: height, draggable: false});

// layer
var layer = new Konva.Layer();

// Data groups
var stateGroup = new Konva.Group();
var transitionGroup = new Konva.Group();
var anchorGroup = new Konva.Group();
var boxGroup = new Konva.Group();
var textGroup = new Konva.Group();

// Dictionaries for storing key information
var transitionDict = {};
var stateDict = {};

// History for undo-redo
let history = [];
let historyStep = -1;

function clearHistory() {
    history = [];
    historyStep = -1;
}

function update_history() {
    // Max history depth of 8

    history = history.slice(0, historyStep + 1);
    history.push({
        "transitions": JSON.parse(JSON.stringify(transitionDict)),
        "states": JSON.parse(JSON.stringify(stateDict))
    });
    historyStep++;
    if (history.length > 10) {
        history.shift()
        historyStep = 9;
    }
}

// Add the groups to the layer and the layer to the stage
layer.add(transitionGroup, anchorGroup, stateGroup, boxGroup, textGroup);
stage.add(layer);

function fitStageIntoParentContainer() {
    // Function updates the size of the container for the design tool and scales it so the machine is not effected
    var container = document.querySelector('.canvas-container');
    width = document.getElementsByClassName('canvas-container').item(0).clientWidth;
    height = document.getElementsByClassName('canvas-container').item(0).clientHeight;

    // now we need to fit stage into parent container
    var containerWidth = container.offsetWidth;

    // but we also make the full scene visible
    // so we need to scale all objects on canvas
    var scale = containerWidth / width;

    stage.width(width * scale);
    stage.height(height * scale);
    stage.scale({x: scale, y: scale});
}

// Id for the objects
var transitionId = 0;
var stateId = 0;
var anchorId = 0;
var textId = 0;

var shiftToggle = false;
var created = false;
var endstate = null;
var inside;
var otherDblClick, selecting;
var transitionTool = false;
var stateTool = false;

var anchor = new Konva.Circle({
    // Anchor for the transition
    x: 0,
    y: 0,
    radius: 7,
    stroke: 'orange',
    strokeWidth: 3,
    hitStrokeWidth: 20,
    visible: false,
    draggable: true,
});

var transition = new Konva.Arrow({
    // Transition object
    points: [0, 0, 0, 0],
    pointerLength: 20,
    pointerWidth: 20,
    name: 'transition',
    fill: 'black',
    stroke: 'black',
    strokeWidth: 4,
    lineJoin: 'round',
    tension: .45,
    hitStrokeWidth: 30,
});

class State {
    // Class for the states (x position, y position, id of the state)
    constructor(x, y, id) {
        // Attributes
        this.id = id;
        this.initialX = x;
        this.initialY = y;
        this.strokeCol = "black";
        this.finalState = false;
        this.outerRadius = 60;

        this.initialState = false;
        let p_id = this.id.toString().split('').join('_');
        this.unparsedText = `S_${p_id}`;

        this.state = new Konva.Circle({
            x: x,
            y: y,
            radius: this.outerRadius,
            fill: 'white',
            stroke: this.strokeCol,
            strokeWidth: 3,
            name: "state",
            id: `${this.id}`,
            draggable: true,
        });


        this.initialStateSelector = new Konva.Rect({
            id: `${this.id}`,
            x: x,
            y: y,
            width: 45,
            height: 20,
            offsetY: -75,
            offsetX: 21,
            visible: false,
            draggable: false,
            stroke: 'black',
            strokeWidth: 3,
            cornerRadius: 3,
        });


        this.startArrow = transition.clone({visible: false, listening: true});

        this.innerCircle = this.state.clone({
            id: `_${this.id}`,
            radius: this.outerRadius - 5,
            visible: false,
            listening: false,
        });

        let t = specialCharacter(this.unparsedText);

        this.text = new Konva.Text({
            id: `${++textId}`,
            x: this.state.position().x,
            y: this.state.position().y,
            text: t,
            fontSize: 20,
            listening: false
        });

        //  Calls the listeners to the object and updates the text
        this.addListeners();
        this.updateText('');

        // Add the objects to their groups
        stateGroup.add(this.state);
        stateGroup.add(this.innerCircle);
        boxGroup.add(this.initialStateSelector);
        transitionGroup.add(this.startArrow);
        textGroup.add(this.text);

    }

    addListeners() {
        // Function to add the listeners to the object

        this.state.addEventListener('mousedown', () => {
            // When the state is clicked
            otherclick = true;
            selectedItem = `state${this.id}`;

            if (!selecting) {
                for (const [_, value] of Object.entries(transitionDict)) {
                    value.setVisibility(false);
                }
            }

            // Deselect all states
            for (const [_, value] of Object.entries(stateDict)) {
                value.setVisibility(false);
            }

            // Select this state
            this.setVisibility(true);
        })

        this.state.addEventListener('dragmove', (evt) => {
            // Event for dragging the state
            if ((evt.shiftKey) || (shiftToggle) || (transitionTool)) {
                // If the shift key is pressed create a transition
                shiftToggle = true;
                // Don't move the state
                this.state.position({'x': this.initialX, 'y': this.initialY});
                createTransition(this.state);
            } else {
                // Actions when the state is moving

                this.updateText('');
                this.initialX = this.state.position().x;
                this.initialY = this.state.position().y;

                this.innerCircle.position({
                    x: this.state.position().x,
                    y: this.state.position().y,
                });

                this.initialStateSelector.position({
                    'x': this.state.position().x,
                    'y': this.state.position().y
                });

                this.startArrow.points([this.state.position().x - 200, this.state.position().y,
                    this.state.position().x - this.outerRadius, this.state.position().y]);

                // Update the lines connecting the states
                updateLines();
            }
        });

        this.state.addEventListener('dragend', function (evt) {
            // Event after dragging has finished

            if (shiftToggle) {
                // When the arrow is connected to a state
                if (inside) {
                    // Connect a transition
                    transitionDict[`transition${transitionId}`].addEndState(endstate);
                } else {
                    // Delete a transition
                    transitionGroup.findOne(`#${transitionId}`).destroy();
                    delete transitionDict[`transition${transitionId--}`];
                }
            }
            shiftToggle = false;
            created = false;
            update_history();
        });


        this.state.addEventListener('dblclick', () => {
            // Event for when the state is double-clicked
            if (!document.getElementById('mealy-machine').checked) {
                // Turn the state into an accepting state
                this.finalState = !this.finalState;
                this.innerCircle.visible(!this.innerCircle.visible());
                update_history();
            }
            otherDblClick = true;
        });


        this.initialStateSelector.addEventListener('click', () => {
            // When the box underneath a state is clicked toggle an initial state
            otherclick = true;
            this.toggleInitialState();
            update_history();
        });

        this.initialStateSelector.addEventListener('dblclick', () => {
            // Disable double clicks on the box
            otherDblClick = true;
        });

    }

    toggleInitialState() {
        // Function to turn this object into the initial state
        if (!this.initialState) {
            // Disable all initial states
            for (const [_, value] of Object.entries(stateDict)) {
                value.initialState = false;
                value.startArrow.visible(false);
                value.initialStateSelector.stroke('black');
            }

            // Turn this state into the initial one
            this.initialState = true;
            this.startArrow.points([this.state.position().x - 200, this.state.position().y,
                this.state.position().x - this.outerRadius, this.state.position().y]);
            this.startArrow.visible(true);
            this.initialStateSelector.stroke('orange');

        } else {
            // If it already an initial state diable it
            this.initialState = false;
            this.startArrow.visible(false);
            this.initialStateSelector.stroke('black');
        }

    }

    setVisibility(bool) {
        // Function to visualise selecting this state
        if (bool) {
            this.setStroke('orange');
            this.initialStateSelector.visible(true);

        } else {
            this.setStroke('black');
            this.initialStateSelector.visible(false);
        }
    }


    updateText(chr) {
        // Function to update the text inside the state
        if (chr.charCodeAt(0) === 8) {
            this.unparsedText = this.unparsedText.substring(0, this.unparsedText.length - 1);
        } else {
            this.unparsedText += chr;
        }

        this.text.text(specialCharacter(this.unparsedText));

        this.text.position({
            x: this.state.position().x,
            y: this.state.position().y,
        });
        this.text.offset({
            x: this.text.width() / 2,
            y: this.text.height() / 2
        })

    }

    setStroke(col) {
        // Function to change the stroke colour of the state
        this.strokeCol = col;
        this.state.stroke(this.strokeCol);
        this.innerCircle.stroke(this.strokeCol);
    }

    delete(noupdate = false) {
        // Function for deleting the state

        // Delete all transitions connected to the state
        for (const [_, value] of Object.entries(transitionDict)) {
            if (value.startState === this.state) {
                value.delete(true);
            } else if (value.endState === this.state) {
                value.delete(true);
            }
        }

        // Delete all the elements
        if (this.finalState) {
            this.innerCircle.destroy();
        }

        if (this.initialState) {
            this.startArrow.destroy();
        }

        this.initialStateSelector.destroy();
        this.state.destroy();
        this.text.destroy();

        if (!noupdate) {
            update_history();
        }

        // Remove this state from the state dictionary
        delete stateDict[`state${this.id}`];
        delete this;

    }

}


class Transition {
    /*
    Class for the Transitions
    args: (starting state of the transition)
     */
    constructor(startState) {
        this.startState = startState;
        this.endState = startState;
        this.id = `${++transitionId}`;
        this.unparsedText = '';

        // Konva Shapes for the transition
        this.anchor = anchor.clone({'id': `${++anchorId}`});
        this.anchor2 = anchor.clone({'id': `${++anchorId}`, visible: false}); // For the self-referencing states
        this.angleDragger = anchor.clone({'id': `${++anchorId}`});
        this.angleLine = new Konva.Line({'id': `${++anchorId}`});
        this.transition = transition.clone({
            id: `${this.id}`,
            name: 'transition',
            stroke: 'black',
            fill: 'black'
        });

        this.anchorDistance = null;
        this.draggerDifference = {'x': 0, 'y': 0};
        this.anchorAngle = null;
        this.straightTransition = true; // Transition always starts straightened

        // Text label
        this.text = new Konva.Text({id: `${++textId}`, text: '', offsetY: 30, fontSize: 17, listening: false});

        // Add the listeners to the objects in the constructor
        this.addListeners();
        // Add the shapes to their group
        transitionGroup.add(this.transition)
        textGroup.add(this.text);
        this.self_reference = false;
    }


    addListeners() {
        /*
        Event listeners for the transitions
         */
        this.transition.addEventListener('click', () => {
            // Selecting a transition
            if (!otherDblClick) {
                otherclick = true;
                selectedItem = `transition${this.id}`
                if (!selecting) {
                    for (const [_, value] of Object.entries(transitionDict)) {
                        value.setVisibility(false);
                    }
                }

                // Deselect other transitions
                for (const [_, value] of Object.entries(stateDict)) {
                    value.setStroke('black');
                }

                // Select this transition
                this.setVisibility(true);
            }
        })

        this.transition.addEventListener('dblclick', () => {
            // Straighten a transition on double-click
            this.setStraight(true);
            this.setVisibility(false);
            this.update();
            otherDblClick = true;
            update_history();
        });

        this.angleDragger.addEventListener('dragend', () => {
            update_history();
        });

        this.anchor.addEventListener('dragend', () => {
            update_history();
        });

    }


    setPoints(p) {
        // Update the points of the transition
        this.points = p;
    }

    update_self_reference_angle() {
        // Function for updating the points in the transition when moving an self-referencing transition
        let angle2 = Math.atan2(this.startState.position().x - this.angleDragger.position().x,
            this.startState.position().y - this.angleDragger.position().y)

        // First anchor poisition
        this.anchor.position({
            x: this.angleDragger.position().x + (this.anchorDistance * Math.sin(-this.anchorAngle + angle2)),
            y: this.angleDragger.position().y + (this.anchorDistance * Math.cos(-this.anchorAngle + angle2)),
        });

        // Second anchor position
        this.anchor2.position({
            x: this.angleDragger.position().x + (this.anchorDistance * Math.sin(this.anchorAngle + angle2)),
            y: this.angleDragger.position().y + (this.anchorDistance * Math.cos(this.anchorAngle + angle2)),
        });

        // Updating the elements to the new positions
        let [startX, startY] = stayOnOutside(this.anchor.position().x, this.anchor.position().y,
            this.startState.position().x, this.startState.position().y, this.startState.radius());

        let [arrowPointX, arrowPointY] = stayOnOutside(this.anchor2.position().x, this.anchor2.position().y,
            this.startState.position().x, this.startState.position().y, this.startState.radius());

        let [lineX, lineY] = stayOnOutside(this.startState.position().x, this.startState.position().y,
            this.angleDragger.position().x, this.angleDragger.position().y, this.angleDragger.radius() + 4);

        this.angleLine.points([this.startState.position().x, this.startState.position().y,
            lineX, lineY]);

        this.transition.points([startX, startY,
            this.anchor.position().x, this.anchor.position().y,
            this.anchor2.position().x, this.anchor2.position().y,
            arrowPointX, arrowPointY]);

        this.draggerDifference = {
            'x': this.angleDragger.position().x - this.startState.position().x,
            'y': this.angleDragger.position().y - this.startState.position().y
        };
        this.updateText('');
    }


    update() {
        // Function to update the position of the a transition
        if (this.self_reference) {
            // For a looping transition
            this.angleDragger.position({
                'x': this.startState.position().x + this.draggerDifference['x'],
                'y': this.startState.position().y + this.draggerDifference['y']
            });
            this.update_self_reference_angle()
        } else {
            // For a normal transition
            if (this.straightTransition) {
                // Run when the transition is straight. Keeps the anchor in the middle between the states
                this.anchor.position({
                    x: (this.startState.position().x + this.endState.position().x) / 2,
                    y: (this.startState.position().y + this.endState.position().y) / 2,
                });

                let [endX, endY] = stayOnOutside(this.anchor.position().x, this.anchor.position().y,
                    this.endState.position().x, this.endState.position().y,
                    this.endState.radius())

                this.transition.points([this.startState.position().x, this.startState.position().y,
                    this.anchor.position().x, this.anchor.position().y,
                    endX, endY]);
            } else {
                // Run when the anchor isn't straight, keeps the anchor where it was before
                let [endX, endY] = stayOnOutside(this.anchor.position().x, this.anchor.position().y,
                    this.endState.position().x, this.endState.position().y,
                    this.endState.radius())
                this.transition.points([this.startState.position().x, this.startState.position().y,
                    this.anchor.position().x, this.anchor.position().y,
                    endX, endY]);
            }
        }
        this.updateText('');
    }


    addEndState(endState, optional = null) {
        // Function to initialise the transition when an end state is added
        if (endState != null) {
            this.endState = endState;
            if (this.endState === this.startState) {
                // When the start state and end state are the same indicating a looping transition
                this.self_reference = true;

                this.anchor.setAttrs({
                    x: endState.position().x + 105,
                    y: endState.position().y + 30,
                    listening: false,
                    visible: false,
                });
                this.anchor2.setAttrs({
                    x: endState.position().x + 105,
                    y: endState.position().y - 30,
                    listening: false,
                    visible: false,
                });

                this.angleDragger.setAttrs({
                    x: endState.position().x + 150,
                    y: endState.position().y,
                });

                this.angleLine.setAttrs({
                    id: `${++anchorId}`,
                    dash: [15, 7],
                    stroke: 'grey',
                    strokeWidth: 2,
                    lineCap: 'round',
                    draggable: false,
                    listening: false,
                });

                // Do the maths for the anchor positions
                let [lineX, lineY] = stayOnOutside(this.startState.position().x, this.startState.position().y,
                    this.angleDragger.position().x, this.angleDragger.position().y, this.angleDragger.radius() + 4);

                this.angleLine.points([this.startState.position().x, this.startState.position().y,
                    lineX, lineY]);

                this.anchorAngle = Math.atan2(this.angleDragger.position().y - this.anchor.position().y,
                    this.angleDragger.position().x - this.anchor.position().x);

                this.anchorDistance = distance(this.angleDragger.position().x, this.angleDragger.position().y,
                    this.anchor.position().x, this.anchor.position().y);

                this.draggerDifference = {
                    'x': this.angleDragger.position().x - this.startState.position().x,
                    'y': this.angleDragger.position().y - this.startState.position().y
                }


                this.angleDragger.addEventListener('dragmove', (e) => {
                    let x = endState.position().x;
                    let y = endState.position().y;

                    let [posx, posy] = stayOnOutside(stage.getRelativePointerPosition().x, stage.getRelativePointerPosition().y,
                        x, y, 150);


                    this.angleDragger.position({
                        'x': posx,
                        'y': posy
                    });

                    this.update_self_reference_angle();

                })


            } else {
                // WHen it is just a normal transition between two different states
                if (optional == null) {
                    this.anchor.setAttrs({
                        x: (this.startState.position().x + this.endState.position().x) / 2,
                        y: (this.startState.position().y + this.endState.position().y) / 2,
                        id: `${++anchorId}`,
                        listening: true,
                    });
                } else {
                    this.anchor.setAttrs(optional);
                }

                // Add the event listeners for the anchor
                this.anchor.addEventListener('click', () => {
                    otherclick = true;
                });

                this.anchor.addEventListener('dblclick', () => {
                    // On double-click straighten the transition
                    otherDblClick = true;
                    this.setStraight(true);
                    this.setVisibility(false);
                    this.update();
                });
                this.anchor.addEventListener('dragmove', () => {
                    this.setStraight(false);
                    updateLines();
                });
            }

            // Select this element after it is created
            selectedItem = `transition${this.id}`
            this.setVisibility(true);

            // Add all the anchors to their group
            anchorGroup.add(this.anchor, this.anchor2, this.angleDragger, this.angleLine);
        }
    }

    setVisibility(bool) {
        // Function for selecting a transition
        if (this.self_reference) {
            this.angleDragger.visible(bool)
            this.angleLine.visible(bool);
            if (!bool) {
                this.text.offsetY(0);
            } else {
                this.text.offsetY(30);
            }
        } else {
            this.anchor.visible(bool);
        }
    }

    delete(noupdate = false) {
        // Function for deleting a transition

        // Delete all the elements
        this.angleLine.destroy();
        this.angleDragger.destroy();
        this.anchor2.destroy();
        this.anchor.destroy();
        this.text.destroy();
        this.transition.destroy();

        if (!noupdate) {
            update_history();
        }

        // Remove this element from the transition dictionary
        delete transitionDict[`transition${this.id}`];
        delete this;
    }

    setStraight(bool) {
        // Set the transition straight
        this.straightTransition = bool;
    }


    updateText(chr) {
        // Update the text on the transition
        if (chr.charCodeAt(0) === 8) { // Backspace
            this.unparsedText = this.unparsedText.substring(0, this.unparsedText.length - 1);
        } else {
            this.unparsedText += chr;
        }

        this.text.text(specialCharacter(this.unparsedText));

        if (this.self_reference) {
            this.text.position({
                x: this.angleDragger.position().x,
                y: this.angleDragger.position().y,
            });

        } else {
            this.text.position({
                x: this.anchor.position().x,
                y: this.anchor.position().y,
            });
        }
        this.text.offsetX(this.text.width() / 2)
    }
}


class Mealy extends Transition {
    /*
    Mealy machine extension of the Transition class
     */
    constructor(startState) {
        // Extend the constructor for the Transition Class
        super(startState);

        // Add extra features
        this.selectedText = 0;
        this.unparsedText2 = '0';
        this.text.listening(true);
        this.text.hitStrokeWidth(3);
        this.text.offsetX(2);

        // New shapes needed
        this.text2 = this.text.clone({listening: true, text: '0', hitStrokeWidth: 3});
        this.divider = this.text.clone({text: '|'});

        // Add the event listeners for the text objects
        this.addTextListeners();
    }

    addTextListeners() {
        /*
        Add listeners for the text objects
         */
        this.text.addEventListener('click', () => {
            // Event listener for the first text object
            if (!otherDblClick) {
                otherclick = true;
                selectedItem = `transition${this.id}`
                if (!selecting) {
                    deselect();
                }

                this.setVisibility(true);
            }
            this.text.fill('orange');
            this.text2.fill('black');
            selectedItem = `transition${this.id}`;
            this.selectedText = 1;
        })

        this.text2.addEventListener('click', () => {
            // Event listener for the second text object
            if (!otherDblClick) {
                otherclick = true;
                selectedItem = `transition${this.id}`
                if (!selecting) {
                    deselect();
                }

                this.setVisibility(true);
            }
            this.text2.fill('orange');
            selectedItem = `transition${this.id}`;
            this.text.fill('black');
            this.selectedText = 2;
        })
    }


    updateTextPositions() {
        // New function to update the text positions
        if (this.self_reference) {
            this.text.position({
                x: this.angleDragger.position().x,
                y: this.angleDragger.position().y,
            });
            this.text2.position({
                x: this.angleDragger.position().x,
                y: this.angleDragger.position().y,
            });
            this.divider.position({
                x: this.angleDragger.position().x,
                y: this.angleDragger.position().y,
            });
        } else {
            this.text.position({
                x: this.anchor.position().x,
                y: this.anchor.position().y,
            });
            this.text2.position({
                x: this.anchor.position().x,
                y: this.anchor.position().y,
            });
            this.divider.position({
                x: this.anchor.position().x,
                y: this.anchor.position().y,
            });
        }
    }

    addEndState(endState, optional = null) {
        super.addEndState(endState, optional);

        // Extend the add end state method to add the new objects
        textGroup.add(this.text2, this.divider);
        this.updateText('');
        this.updateText2('');
        this.addTextListeners();
    }

    // Functions for updating the text inside the
    updateText(chr) {
        if (chr.charCodeAt(0) === 8) { // Backspace
            this.unparsedText = this.unparsedText.substring(0, this.unparsedText.length - 1);
        } else {
            if (this.unparsedText === '_') {
                this.unparsedText = chr;
            } else {
                this.unparsedText += chr;
            }
        }

        if (this.unparsedText === '') {
            this.unparsedText = '_';
        }

        // Check if the updated text has any special characters
        this.text.text(specialCharacter(this.unparsedText))

        this.text.offsetX(this.text.width() + 3);
        this.updateTextPositions()
    }

    updateText2(chr) {
        if (chr.charCodeAt(0) === 8) { // Backspace
            this.unparsedText2 = this.unparsedText2.substring(0, this.unparsedText2.length - 1);
        } else {
            if (this.unparsedText2 === '_') {
                this.unparsedText2 = chr;
            } else {
                this.unparsedText2 += chr;
            }
        }

        if (this.unparsedText2 === '') {
            this.unparsedText2 = '_';
        }

        // Check if the updated text has any special characters
        this.text2.text(specialCharacter(this.unparsedText2))
        this.text2.offsetX(-4);

        this.updateTextPositions();
    }

    update_self_reference_angle() {
        // Extend this to add the new shapes
        super.update_self_reference_angle();
        this.updateText2('');
        this.updateText('');
        this.updateTextPositions();
    }

    update() {
        // Extended to add the new shapes
        super.update();
        this.updateText2('');
        this.updateText('');
        this.updateTextPositions();
    }

    setVisibility(bool) {
        // Extended to add the new shapes
        if (this.self_reference) {
            this.angleDragger.visible(bool)
            this.angleLine.visible(bool);
            if (!bool) {
                this.text.offsetY(0);
                this.text2.offsetY(0);
                this.divider.offsetY(0);
            } else {
                this.text.offsetY(30);
                this.divider.offsetY(30);
                this.text2.offsetY(30);
            }
        } else {
            this.anchor.visible(bool);
        }
    }

    delete(noupdate = false) {
        // Extended to delete the new shapes
        super.delete(noupdate);
        this.text2.destroy();
        this.divider.destroy();
    }

}

class Moore extends State {
    /*
    Moore machine class that extends the existing State Class
     */
    constructor(x, y, id) {
        super(x, y, id);

        this.selectedText = 0;
        this.unparsedText2 = '0'
        this.divider = new Konva.Line({
            points: [this.state.position().x - 25, this.state.position().y, this.state.position().x + 25, this.state.position().y],
            stroke: 'black',
            lineCap: 'round',
            strokeWidth: 2,
            listening: false
        });
        this.text.fontSize(18);
        this.text.offsetY(25);
        this.text.hitStrokeWidth(3);
        this.text.listening(true);
        this.text.draggable(true);
        this.text2 = this.text.clone({offsetY: -11, text: '0', listening: true, draggable: true});

        textGroup.add(this.text2);
        stateGroup.add(this.divider);
        this.updateText2('');

        // New listeners for the mealy machine
        this.addMooreListeners();
    }

    textMoveEvent(evt, core) {
        // Event listeners for the text objects
        // This ensured that when the user dragmoved on a text object, the state would still move with it
        if ((evt.shiftKey) || (shiftToggle) || (transitionTool)) {
            shiftToggle = true;
            this.state.position({'x': this.initialX, 'y': this.initialY});
            core.position({'x': this.initialX, 'y': this.initialY});
            createTransition(this.state);
        } else {
            // Actions when the state is moving
            this.initialX = this.text.position().x;
            this.initialY = this.text.position().y;

            this.state.position({
                x: core.position().x,
                y: core.position().y,
            });

            this.divider.points([this.state.position().x - 25, this.state.position().y, this.state.position().x + 25, this.state.position().y]);

            this.innerCircle.position({
                x: this.state.position().x,
                y: this.state.position().y,
            });

            this.initialStateSelector.position({
                'x': this.state.position().x,
                'y': this.text.position().y
            });

            this.startArrow.points([this.state.position().x - 200, this.state.position().y,
                this.state.position().x - this.outerRadius, this.state.position().y]);

            updateLines();
        }
    }

    addMooreListeners() {
        // Listeners for the moore machine
        this.state
            .removeEventListener('dragmove', () => {
            })
            .removeEventListener('dblclick', () => {
            })
            .addEventListener('dblclick', () => {
                otherDblClick = true
            })
            .addEventListener('dragmove', (evt) => {
                if ((evt.shiftKey) || (shiftToggle) || (transitionTool)) {
                    shiftToggle = true;
                    this.state.position({'x': this.initialX, 'y': this.initialY});
                    createTransition(this.state);
                } else {
                    // Actions when the state is moving
                    this.divider.points([this.state.position().x - 25, this.state.position().y, this.state.position().x + 25, this.state.position().y]);
                    this.updateText('');
                    this.updateText2('');
                    this.initialX = this.state.position().x;
                    this.initialY = this.state.position().y;
                    this.innerCircle.position({
                        x: this.state.position().x,
                        y: this.state.position().y,
                    });

                    this.initialStateSelector.position({
                        'x': this.state.position().x,
                        'y': this.state.position().y
                    });

                    this.startArrow.points([this.state.position().x - 200, this.state.position().y,
                        this.state.position().x - this.outerRadius, this.state.position().y]);

                    updateLines();
                }
            });


        this.text.addEventListener('dragmove', (evt) => {
            this.textMoveEvent(evt, this.text);
            this.updateText2('');
        });

        this.text2.addEventListener('dragmove', (evt) => {
            this.textMoveEvent(evt, this.text2);
            this.updateText('');
        });

        this.text.addEventListener('click', () => {
            // Select the text when it is clicked
            if (!otherDblClick) {
                otherclick = true;
                selectedItem = `state${this.id}`
                if (!selecting) {
                    deselect();
                }

                this.setVisibility(true);
            }

            this.text.fill('orange');
            this.text2.fill('black');
            selectedItem = `state${this.id}`;
            this.selectedText = 1;
        })

        this.text2.addEventListener('click', () => {
            // Select the text when it is clicked
            if (!otherDblClick) {
                otherclick = true;
                selectedItem = `state${this.id}`
                if (!selecting) {
                    deselect()
                }
                this.setVisibility(true);
            }
            this.text2.fill('orange');
            selectedItem = `state${this.id}`;
            this.text.fill('black');
            this.selectedText = 2;
        })
    }

    updateText(chr) {
        if (chr.charCodeAt(0) === 8) { // Backspace
            this.unparsedText = this.unparsedText.substring(0, this.unparsedText.length - 1);
        } else {
            if (this.unparsedText === '_') {
                this.unparsedText = chr
            } else {
                this.unparsedText += chr;
            }
        }

        if (this.unparsedText === '') {
            this.unparsedText = '_'
        }

        this.text.text(specialCharacter(this.unparsedText));
        this.text.position({
            x: this.state.position().x,
            y: this.state.position().y,
        });
        this.text.offsetX(this.text.width() / 2);
    }

    updateText2(chr) {
        if (chr.charCodeAt(0) === 8) { // Backspace
            this.unparsedText2 = this.unparsedText2.substring(0, this.unparsedText2.length - 1);
        } else {
            if (this.unparsedText2 === '_') {
                this.unparsedText2 = chr
            } else {
                this.unparsedText2 += chr;
            }
        }

        if (this.unparsedText2 === '') {
            this.unparsedText2 = '_'
        }

        this.text2.text(specialCharacter(this.unparsedText2));
        this.text2.position({
            x: this.state.position().x,
            y: this.state.position().y,
        });
        this.text2.offsetX(this.text2.width() / 2)

    }


    delete(noupdate = false) {
        // Extended to delete the new objects
        super.delete(noupdate);
        this.text2.destroy();
        this.divider.destroy();
    }
}


function updateLines() {
    // Function to update all the transitions at the same time
    for (const [_, value] of Object.entries(transitionDict)) {
        value.update();
    }
    layer.draw();
}

function beginningFrame() {
    // The default machine presented to the user
    let state1 = new State(width / 4, height / 2 + 50, ++stateId);
    let state2 = new State(width / 1.3, height / 2 - 50, ++stateId);

    state1.toggleInitialState()
    state1.finalState = true;
    state1.innerCircle.visible(true);


    stateDict['state1'] = state1;
    stateDict['state2'] = state2;

    let transition1 = new Transition(state1.state);
    let transition2 = new Transition(state2.state);


    // Optional anchor to set the curve without user input
    let a1 = {
        x: (state1.state.position().x + state2.state.position().x) / 2 - 20,
        y: (state1.state.position().y + state2.state.position().y) / 2 - 150,
        id: `${++anchorId}`,
        listening: true,
    };

    let a2 = {
        x: (state1.state.position().x - 15 + state2.state.position().x) / 2 + 20,
        y: (state1.state.position().y + state2.state.position().y) / 2 + 150,
        id: `${++anchorId}`,
        listening: true,
    };


    transition1.addEndState(state2.state, a1);
    transition2.addEndState(state1.state, a2);

    transition1.updateText("1");
    transition2.updateText("0");

    transition1.setStraight(false);
    transition2.setStraight(false);

    transition1.update();
    transition2.update();

    transitionDict[`transition1`] = transition1;
    transitionDict['transition2'] = transition2;

    update_history();
}


var selectedItem = null;
let otherclick = false;
var container = stage.container();
container.tabIndex = 1;

function checkSpecialCharacters() {
    // Function for checking if any of the strings in the diagram have any special characters
    for (const [_, value] of Object.entries(transitionDict)) {
        if (value.constructor.name === 'Mealy') {
            value.text2.text(specialCharacter(value.text2.text()))
            value.updateText2('');
        }
        value.text.text(specialCharacter(value.text.text()))
        value.updateText('');
    }

    for (const [_, value] of Object.entries(stateDict)) {
        if (value.constructor.name === 'Moore') {
            value.text2.text(specialCharacter(value.text2.text()))
            value.updateText2('');
        }
        value.text.text(specialCharacter(value.text.text()));
        value.updateText('');
    }
}

function specialCharacter(text) {
    // Function to add special characters to the text
    // Godlike string wizardry from my guy
    let greekLetters = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega', 'emptyset', 'rightarrow', 'leftarrow'];

    for (let i = 0; i < greekLetters.length; i++) {
        let name = greekLetters[i];
        if (name === "emptyset") {
            text = text.replace(new RegExp('\\\\' + name, 'g'), String.fromCharCode(8709));
            continue;
        }
        if (name === "rightarrow") {
            text = text.replace(new RegExp('\\\\' + name, 'g'), String.fromCharCode(8594));
            continue;
        }
        if (name === "leftarrow") {
            text = text.replace(new RegExp('\\\\' + name, 'g'), String.fromCharCode(8592));
            continue;
        }
        text = text.replace(new RegExp('\\\\' + name, 'g'), String.fromCharCode(913 + i + (i > 16)));
        text = text.replace(new RegExp('\\\\' + name.toLowerCase(), 'g'), String.fromCharCode(945 + i + (i > 16)));
    }

    // subscripts
    for (var i = 0; i < 10; i++) {
        text = text.replace(new RegExp('_' + i, 'g'), String.fromCharCode(8320 + i));
    }

    return text;
}


container.addEventListener('keydown', (e) => {
    // When a key is pressed down
    let key = e.keyCode;
    if (e.keyCode !== 16) { // Ignore SHIFT
        if (e.keyCode === 46 && selectedItem != null) {
            // When the delete key is pressed, delete the selected item
            if (Object.keys(stateDict).includes(selectedItem)) {
                stateDict[selectedItem].delete();
            } else if (Object.keys(transitionDict).includes(selectedItem)) {
                transitionDict[selectedItem].delete();
            }
        }
        if (e.keyCode === 8 && selectedItem !== null) {
            let c = String.fromCharCode(key);
            if (Object.keys(transitionDict).includes(selectedItem)) {
                // Update for the transitions
                if (transitionDict[selectedItem].constructor.name === "Mealy") {
                    if (transitionDict[selectedItem].selectedText === 1) {
                        transitionDict[selectedItem].updateText(c);
                    } else {
                        transitionDict[selectedItem].updateText2(c);
                    }
                } else {
                    transitionDict[selectedItem].updateText(c);
                }
            }
            // Update text for the states
            if (Object.keys(stateDict).includes(selectedItem)) {
                if (stateDict[selectedItem].constructor.name === "Moore") {
                    if (stateDict[selectedItem].selectedText === 1) {
                        stateDict[selectedItem].updateText(c)
                    } else {
                        stateDict[selectedItem].updateText2(c)
                    }
                } else {
                    stateDict[selectedItem].updateText(c)
                }
            }


        }
        update_history();
    }
});

container.addEventListener('keypress', (e) => {
    // Same as before for the keypress functionality
    e.preventDefault();
    let key = e.keyCode;
    if (e.keyCode !== 16) { // Ignore SHIFT
        if (e.keyCode === 46 && selectedItem != null) {
            if (Object.keys(stateDict).includes(selectedItem)) {
                stateDict[selectedItem].delete();
            } else if (Object.keys(transitionDict).includes(selectedItem)) {
                transitionDict[selectedItem].delete();
            }
        } else {
            if (selectedItem != null && key >= 0x20 && key <= 0x7E && !e.metaKey && !e.altKey && !e.ctrlKey) {
                let c = String.fromCharCode(key);
                if (Object.keys(transitionDict).includes(selectedItem)) {
                    if (transitionDict[selectedItem].constructor.name === "Mealy") {
                        if (transitionDict[selectedItem].selectedText === 1) {
                            transitionDict[selectedItem].updateText(c);
                        } else {
                            transitionDict[selectedItem].updateText2(c);
                        }
                    } else {
                        transitionDict[selectedItem].updateText(c);
                    }
                }

                if (Object.keys(stateDict).includes(selectedItem)) {
                    if (stateDict[selectedItem].constructor.name === "Moore") {
                        if (stateDict[selectedItem].selectedText === 1) {
                            stateDict[selectedItem].updateText(c)
                        } else {
                            stateDict[selectedItem].updateText2(c)
                        }
                    } else {
                        stateDict[selectedItem].updateText(c)
                    }
                }
            }


        }
        checkSpecialCharacters()
        update_history();
    }
});

stage.on('dblclick', function () {
    // When empty space is double-clicked, create a new state
    if (!otherDblClick && !stateTool) {
        ++stateId;
        stateDict[`state${stateId}`] = newState();
        layer.add(stateGroup);
        update_history();
    }
    otherDblClick = false;
});


stage.on('click', function () {
    // When empty space is clicked, and the select tool is selected, create a new state
    // Otherwise deselect everything
    if (stateTool && !otherDblClick && !otherclick && !selecting) {
        ++stateId;
        stateDict[`state${stateId}`] = newState();
        layer.add(stateGroup);
        update_history();
    }
    if (!otherclick) {
        selectedItem = null;
        deselect();
    }
    otherDblClick = false;
    otherclick = false;


})

function newState() {
    // Function for creating a new state
    var state;

    if (document.getElementById('moore-machine').checked) {
        state = new Moore(stage.getRelativePointerPosition().x, stage.getRelativePointerPosition().y, stateId)
    } else {
        state = new State(stage.getRelativePointerPosition().x, stage.getRelativePointerPosition().y, stateId)
    }

    return state;
}

function deselect() {
    // Function for deselecting all elements in the diagram
    for (const [_, value] of Object.entries(stateDict)) {
        value.setVisibility(false);
        if (value.constructor.name === 'Moore') {
            value.text.fill('black');
            value.text2.fill('black');
        }
    }

    for (const [_, value] of Object.entries(transitionDict)) {
        value.setVisibility(false);
        if (value.constructor.name === 'Mealy') {
            value.text.fill('black');
            value.text2.fill('black');
        }
        value.transition.stroke('black');
        value.transition.fill('black');
    }
}

function distance(x1, y1, x2, y2) {
    // Function for calculating the distance between two points
    let xdif = Math.pow((x2 - x1), 2);
    let ydif = Math.pow((y2 - y1), 2);
    return Math.sqrt(xdif + ydif);

}

function stayOnOutside(startX, startY, endX, endY, r) {
    // Function for calculating the point at which a line intersects with a circle
    let angle = Math.atan2((endY - startY), (endX - startX));
    let ydif = Math.sin(angle) * r;
    let xdif = Math.cos(angle) * r;

    return [(endX - xdif), (endY - ydif)];
}

function createTransition(startState) {
    // Function for creating a transition from a start state
    if (!created) {
        // Not yet been created
        var t;
        if (document.getElementById('mealy-machine').checked) {
            t = new Mealy(startState);
        } else {
            t = new Transition(startState);
        }
        // Set the end point of the transition to the mouse pointer position
        t.setPoints([startState.position().x, startState.position().y, stage.getRelativePointerPosition().x, stage.getRelativePointerPosition().y])
        transitionDict[`transition${t.id}`] = t;
        created = true;

    } else {
        // The transition has been created
        let current_draw = transitionDict[`transition${transitionId}`]
        current_draw.transition.tension(0.45);

        var endPointX = stage.getRelativePointerPosition().x;
        var endPointY = stage.getRelativePointerPosition().y;

        inside = false;
        endstate = null;

        // Check if the transition is inside of a state
        for (const [_, state] of Object.entries(stateDict)) {
            if (distance(endPointX, endPointY, state.state.position().x, state.state.position().y) < state.outerRadius) {
                [endPointX, endPointY] = stayOnOutside(startState.position().x, startState.position().y,
                    state.state.position().x, state.state.position().y, state.outerRadius)
                endstate = state.state;
                inside = true;
            }
        }

        // If the transition is looping
        if (endstate === startState && endstate !== null) {
            // Set the tension to be looser
            current_draw.transition.tension(0.75);

            // Set the anchor points
            let a1 = [startState.position().x + 105, startState.position().y + 30];
            let a2 = [startState.position().x + 105, startState.position().y - 30];


            // Set the start and the end points
            let [startX, startY] = stayOnOutside(a1[0], a1[1],
                startState.position().x, startState.position().y, startState.radius());

            let [arrowPointX, arrowPointY] = stayOnOutside(a2[0], a2[1],
                startState.position().x, startState.position().y, startState.radius());

            current_draw.transition.setPoints([startX, startY,
                a1[0], a1[1], a2[0], a2[1],
                arrowPointX, arrowPointY])
        } else {
            // Normal transition
            current_draw.transition.setPoints([startState.position().x, startState.position().y, endPointX, endPointY])
        }

        // Add the transition to the group
        layer.add(transitionGroup);
        layer.draw();
    }
}


//    ----------- Tool Selection -----------
let settings_visible = false;

var btnContainer = document.getElementById("tool-group");
var btns = btnContainer.getElementsByClassName("btn");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
    });
}


$(document).on('click', '#zoom-out', function () {
    zoom(true);
});
$(document).on('click', '#zoom-in', function () {
    zoom(false);
});
$(document).on('click', '#select-button', function () {
    select("select");
});
$(document).on('click', '#move-button', function () {
    select("move");
});
$(document).on('click', '#new-transition', function () {
    select('transition');
});
$(document).on('click', '#new-state', function () {
    select('state');
});
$(document).on('click', '#undo-button', function () {
    if (historyStep !== 0) {
        historyStep -= 1;
        regenerate(history[historyStep], document.getElementById("diagram-title").value);
    }
});
$(document).on('click', '#redo-button', function () {
    if (historyStep !== history.length - 1) {
        historyStep += 1;
        regenerate(history[historyStep], document.getElementById("diagram-title").value);
    }
});

$(document).on('click', '.graphvis', function () {
    convertToDOT();
});
$(document).on('click', '.graphml', function () {
    convertToGraphML();
});
$(document).on('click', '#resizer', function () {
    // When the toggle to extend the settings and simulator tab is clicked

    let settings = document.getElementById('settings_div');
    let resizer = document.getElementById('resizer_svg');

    if (!settings_visible) {
        // Hide the tab
        settings.setAttribute("style", "background-color: rgb(30, 30, 30); width: 350px; display: inline-grid;");
        settings.style.width = "350px";
        settings.style.backgroundColor = "rgb(30,30,30)";
        settings.style.display = "inline-grid";

        document.getElementsByClassName('simulator-actions').item(0).setAttribute('style', 'width: 100%');

        resizer.setAttribute("data-icon", "angle-right");
        resizer.setAttribute("class", "close-icon svg-inline--fa fa-angle-right fa-w-8");
        resizer.setAttribute("transform", "rotate(180)")
        resizer.setAttribute('viewBox', "7 0 10 20");

        resizer.class = "close-icon svg-inline--fa fa-angle-right fa-w-8";

        settings_visible = true;
    } else {
        // Show the tab
        deselect();
        settings.setAttribute("style", "background-color: rgb(30, 30, 30); width: 6px; display: inline-grid");
        settings.style.width = "6px";
        settings.style.backgroundColor = "rgb(30,30,30)";
        settings.style.display = "inline-grid";

        document.getElementsByClassName('simulator-actions').item(0).setAttribute('style', 'width: 300px');
        resizer.setAttribute("data-icon", "angle-left");
        resizer.setAttribute("class", "close-icon svg-inline--fa fa-angle-left fa-w-8");
        resizer.class = "close-icon svg-inline--fa fa-angle-left fa-w-8";
        resizer.setAttribute("transform", "rotate(0)");
        resizer.setAttribute('viewBox', "5 4 10 20");
        settings_visible = false;
    }

    // Resize the design tool
    fitStageIntoParentContainer();
})

function zoom(out) {
    // Funciton for zooming the the diagram in and out

    var oldScale = stage.scaleX();
    var scaleBy = 1.05;
    var newScale;
    var moveTo = {
        x: (width / 2 - stage.x()) / oldScale,
        y: (height / 2 - stage.y()) / oldScale,
    };

    // Scaling
    if (out) {
        newScale = oldScale / scaleBy;
        stage.scale({'x': oldScale / scaleBy, 'y': oldScale / scaleBy});
    } else {
        newScale = oldScale * scaleBy;
        stage.scale({'x': oldScale * scaleBy, 'y': oldScale * scaleBy});
    }

    // Keeping the machine in the same relative place
    var newPos = {
        x: width / 2 - moveTo.x * newScale,
        y: height / 2 - moveTo.y * newScale,
    };
    stage.position(newPos);

    // Changing the zoom percentage value
    document.getElementById("zoom-value").textContent = (Number(newScale * 100).toFixed(0)) + '%';
}

function select(tool) {
    // Function for selecting the tools in the toolbar

    deselect();
    stage.container().style.cursor = 'default';
    stage.draggable(false);
    transitionTool = false;
    stateTool = false;
    selecting = false;

    switch (tool) {
        case "select":
            selecting = true;
            for (const [_, value] of Object.entries(transitionDict)) {
                value.setVisibility(true);
            }
            break;
        case "move":
            stage.container().style.cursor = 'move';
            stage.draggable(true);
            break;
        case "state":
            stateTool = true;
            break;
        case "transition":
            transitionTool = true;
            break;
    }
}

function convertToGraphML() {
    // Function for converting the machine into GraphML
    let struct = "<graphml xsi:schemaLocation=\"http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml.html/2.0/ygraphml.xsd \" xmlns=\"http://graphml.graphdrawing.org/xmlns\" xmlns:demostyle=\"http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0\" xmlns:y=\"http://www.yworks.com/xml/yfiles-common/3.0\" xmlns:x=\"http://www.yworks.com/xml/yfiles-common/markup/3.0\" xmlns:yjs=\"http://www.yworks.com/xml/yfiles-for-html/2.0/xaml\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
        `<key id="d0" for="node" attr.name="NodeLabels" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/NodeLabels"/>
	<key id="d1" for="node" attr.name="NodeGeometry" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/NodeGeometry"/>
	<key id="d2" for="all" attr.name="UserTags" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/UserTags"/>
	<key id="d3" for="node" attr.name="NodeStyle" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/NodeStyle"/>
	<key id="d4" for="edge" attr.name="EdgeLabels" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/EdgeLabels"/>
	<key id="d5" for="edge" attr.name="EdgeGeometry" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/EdgeGeometry"/>
	<key id="d6" for="edge" attr.name="EdgeStyle" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/EdgeStyle"/>
	<key id="d7" for="port" attr.name="PortLabels" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/PortLabels"/>
	<key id="d8" for="port" attr.name="PortLocationParameter" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/PortLocationParameter">
		<default>
			<x:Static Member="y:FreeNodePortLocationModel.NodeCenterAnchored"/>
		</default>
	</key>
	<key id="d9" for="port" attr.name="PortStyle" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/PortStyle">
		<default>
			<x:Static Member="y:VoidPortStyle.Instance"/>
		</default>
	</key>
	<key id="d10" attr.name="SharedData" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/SharedData"/>
	<data key="d10">
		<y:SharedData>
			<yjs:DefaultLabelStyle x:Key="1" font="{y:GraphMLReference 3}" textFill="BLACK"/>
			<yjs:PolylineEdgeStyle x:Key="2" targetArrow="DEFAULT"/>
			<yjs:Font x:Key="3" fontSize="12"/>
			<y:EdgeSegmentLabelModel x:Key="4" AutoRotationEnabled="false"/>
			<yjs:DefaultLabelStyle x:Key="5" font="{y:GraphMLReference 3}" textFill="BLACK"/>
		</y:SharedData>
	</data>\n` +
        "<graph id=\"G\" edgedefault=\"directed\">\n";
    for ([_, value] of Object.entries(stateDict)) {
        struct += `<node id=\"${value.state.id()}\">
<data key="d1">
    <y:RectD X="-297" Y="117.5" Width="80" Height="40"/>
</data>
<data key="d3">
<demostyle:FlowchartNodeStyle type="start2" fill="#FFB7C9E3"/>
</data>
            <data key="d0">
				<x:List>
					<y:Label LayoutParameter="{x:Static y:InteriorLabelModel.Center}" Style="{y:GraphMLReference 1}" PreferredSize="20,14">
						<y:Label.Text>${value.text.text()}</y:Label.Text>
					</y:Label>
				</x:List>
			</data>
</node>\n`;
    }
    for ([_, value] of Object.entries(transitionDict)) {
        struct += `<edge id=\"${value.transition.id()}\" source=\"${value.startState.id()}\" target=\"${value.endState.id()}\">
\t<data key="d4">
				<x:List>
					<y:Label Style="{y:GraphMLReference 5}" PreferredSize="21,14">
						<y:Label.Text>${value.text.text()}</y:Label.Text>
						<y:Label.LayoutParameter>
							<y:EdgeSegmentLabelModelParameter Model="{y:GraphMLReference 4}" SideOfEdge="LeftOfEdge" SegmentRatio="0"/>
						</y:Label.LayoutParameter>
					</y:Label>
				</x:List>
			</data>
			<data key="d6">
                <y:GraphMLReference ResourceKey="2"/>
            </data>
</edge>`
    }
    struct += "</graph>\n" + "</graphml>";

    // Downloading the graphml
    const blob = new Blob([struct], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    download(url, 'fsm.graphml');
    URL.revokeObjectURL(url);
}


function convertToDOT() {
    // Function for converting the machine to GraphVis
    let endnodes = '';
    let struct = "" +
        "digraph fsm {\n" +
        "\tnode [fontname=\"Helvetica,Arial,sans-serif\"]\n" +
        "\tedge [fontname=\"Helvetica,Arial,sans-serif\"]\n" +
        "\trankdir=LR;\n" +
        `\tnode [shape = doublecircle]; ${endnodes}\n`;

    for (const [_, value] of Object.entries(stateDict)) {
        if (value.finalState) {
            struct += `\t${value.text.text()}\n`
        }
    }

    struct += "\tnode [shape = circle];\n";

    for (const [_, value] of Object.entries(transitionDict)) {
        struct += `\t${stateDict[`state${value.startState.id()}`].text.text()} -> ${stateDict[`state${value.endState.id()}`].text.text()} [label = \"${value.text.text()}\"];\n`;
    }

    struct += "\tnode [shape = none];\n";

    for (const [_, value] of Object.entries(stateDict)) {
        if (value.initialState) {
            struct += `\t"" -> ${value.text.text()}\n`;
        }
    }

    struct += '}';

    // Downloading the graphvis
    const blob = new Blob([struct], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    download(url, 'fsm.dot');
    URL.revokeObjectURL(url);
}


function save_json() {
    // Function for saving the JSON data of the machine, used for imports later on
    let data = JSON.stringify(
        {
            'transitions': JSON.parse(JSON.stringify(transitionDict)),
            'states': JSON.parse(JSON.stringify(stateDict)),

        });
    const url = "data:text/json;charset=utf-8," + encodeURIComponent(data);
    download(url, 'statemachine.json');
}

function export_png() {
    // Exporting the machine into a PNG
    deselect();
    let data = layer.toDataURL({
        mimeType: 'image/png',
    });
    download(data, 'statemachine.png');
}

function json_state_table() {
    // Exporting the state table representation as JSON
    let stateTable = []

    if (document.getElementById('mealy-machine').checked) {
        for (const [_, state] of Object.entries(stateDict)) {
            let data = []

            for (const [_, transition] of Object.entries(transitionDict)) {
                if (stateDict[`state${transition.startState.id()}`] === state) {
                    data.push({
                        'transition': transition.text.text(),
                        'output': transition.text2.text(),
                        'nextState': stateDict[`state${transition.endState.id()}`].text.text()
                    });
                }
            }
            stateTable.push({
                'state': state.text.text(),
                'transitions': data
            });
        }
    } else if (document.getElementById('moore-machine').checked) {
        for (const [_, state] of Object.entries(stateDict)) {
            let data = []

            for (const [_, transition] of Object.entries(transitionDict)) {
                if (stateDict[`state${transition.startState.id()}`] === state) {
                    data.push({
                        'transition': transition.text.text(),
                        'output': stateDict[`state${transition.endState.id()}`].text2.text(),
                        'nextState': stateDict[`state${transition.endState.id()}`].text.text()
                    });
                }
            }
            stateTable.push({
                'state': state.text.text(),
                'transitions': data
            });
        }
    } else {
        for (const [_, state] of Object.entries(stateDict)) {
            let data = []

            for (const [_, transition] of Object.entries(transitionDict)) {
                if (stateDict[`state${transition.startState.id()}`] === state) {
                    data.push({
                        'transition': transition.text.text(),
                        'nextState': stateDict[`state${transition.endState.id()}`].text.text()
                    });
                }
            }
            stateTable.push({
                'state': state.text.text(),
                'transitions': data
            });
        }
    }
    return stateTable;
}

function csv_state_table() {
    // Exporting the CSV state table representation
    let stateTable = json_state_table();
    let seen = [];
    let csv_text = 'States,';

    for (const [_, value] of Object.entries(transitionDict)) {
        if (!seen.includes(value.text.text())) {
            seen.push(value.text.text());
        }
    }
    let mealymoore = !document.getElementById('default-machine').checked;

    for (let i = 0; i < seen.length; i++) {
        if (i === seen.length - 1) {
            csv_text += `${seen[i]}\n`;
        } else {
            csv_text += `${seen[i]},`;
        }
    }

    for (let i of stateTable) {
        csv_text += `${i['state']},`
        let aligned = []
        // Aligning the transitions with the order they appear in the table
        for (let j of seen) {
            let pushed = false;
            for (let k of i['transitions']) {
                if (j === k['transition']) {
                    if (mealymoore) {
                        aligned.push([k['nextState'], k['output']]);
                    } else {
                        aligned.push(k['nextState']);
                    }
                    pushed = true;
                }
            }
            if (!pushed) {
                if (mealymoore) {
                    aligned.push(['', ''])
                } else {
                    aligned.push('');
                }
            }
        }

        for (let j = 0; j < aligned.length; j++) {
            if (j === aligned.length - 1) {
                if (mealymoore) {
                    if (aligned[j][1] === '' && aligned[j][0] === '') {
                        csv_text += ',\n';
                    } else {
                        csv_text += `${aligned[j][0]}|${aligned[j][1]}\n`;
                    }
                } else {
                    csv_text += `${aligned[j]}\n`;
                }
            } else {
                if (mealymoore) {
                    if (aligned[j][1] === '' && aligned[j][0] === '') {
                        csv_text += ',';
                    } else {
                        csv_text += `${aligned[j][0]}|${aligned[j][1]},`;
                    }
                } else {
                    csv_text += `${aligned[j]},`;
                }
            }

        }

    }
    const blob = new Blob([csv_text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    download(url, 'fsm.csv');
    URL.revokeObjectURL(url);
}

function html_state_table() {
    // Exporting the HTML state table representation
    let stateTable = json_state_table();


    let seen = [];
    for (const [_, value] of Object.entries(transitionDict)) {
        if (!seen.includes(value.text.text())) {
            seen.push(value.text.text());
        }
    }
    let mealymoore = !document.getElementById('default-machine').checked;

    let html_body = "<html>" +
        "<head/>" +
        "<body>" +
        '<table border="1">' +
        "<tr>" +
        '<th valign="bottom" rowspan="2">States</th>' +
        `<th colspan="${seen.length}" halign="center">Actions</th>` +
        "</tr>" +
        "<tr>";

    for (let i of seen) {
        html_body += `<th>${i}</th>`;
    }

    html_body += "</tr>";

    for (let i of stateTable) {

        let aligned = []
        // Aligning the transitions with the order they appear in the table
        for (let j of seen) {
            let pushed = false;
            for (let k of i['transitions']) {
                if (j === k['transition']) {
                    if (mealymoore) {
                        aligned.push([k['nextState'], k['output']]);
                    } else {
                        aligned.push(k['nextState']);
                    }
                    pushed = true;
                }
            }
            if (!pushed) {
                if (mealymoore) {
                    aligned.push(['', ''])
                } else {
                    aligned.push('');
                }
            }
        }

        html_body += "<tr>" +
            `<td>${i['state']}</td>`;

        for (let j of aligned) {
            if (mealymoore) {
                if (j[1] === '' && j[0] === '') {
                    html_body += `<td></td>`;
                } else {
                    html_body += `<td>${j[0]}|${j[1]}</td>`;
                }
            } else {
                html_body += `<td>${j}</td>`;
            }
        }

        html_body += "</tr>"
    }


    html_body += "</table>" +
        "</body>" +
        "</html>";

    const blob = new Blob([html_body], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    download(url, 'fsm.html');
    URL.revokeObjectURL(url);
}


function export_json_state_table() {
    let stateTable = json_state_table();
    const blob = new Blob([JSON.stringify(stateTable)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    download(url, 'fsm.json');
    URL.revokeObjectURL(url);
}


const download = (path, filename) => {
    // Create a new link
    const anchor = document.createElement('a');
    anchor.href = path;
    anchor.download = filename;

    // Append to the DOM
    document.body.appendChild(anchor);

    // Trigger `click` event
    anchor.click();

    // Remove element from DOM
    document.body.removeChild(anchor);
}

function regenerate_self() {
    regenerate({
        "transitions": JSON.parse(JSON.stringify(transitionDict)),
        "states": JSON.parse(JSON.stringify(stateDict))
    }, document.getElementById('diagram-title').value, true);
}


function regenerate(save_state, title, switched = false) {
    /*
    Function to regenerate the scene data given the json scene and the stateTable
    This is important as the stage does not contain the transitiondict data or statedict values.
    Will be used for imports and loading users saved machines so that users can still edit them

    save_state = {'transitions': transitionDict, 'states': statedict }
    switched is for when swithcing between different machines in the settings tabs
     */


    // Delete the current frame
    for (const [_, value] of Object.entries(transitionDict)) {
        value.delete(true);
    }
    for (const [_, value] of Object.entries(stateDict)) {
        value.delete(true);
    }

    stateId = 0;
    transitionId = 0
    anchorId = 0;
    textId = 0;
    let isMealyMoore = false;


    // Add the save_state transitionDict and stateDict to the frame
    for (const [key, value] of Object.entries(save_state['states'])) {
        if (value.divider !== undefined && !switched) {
            isMealyMoore = true;
            document.getElementById('moore-machine').checked = true;
        }

        if (switched && !document.getElementById('default-machine').checked) {
            isMealyMoore = true;
        }

        stateId++;

        // Regenerate the moore machine if that is selected
        if (isMealyMoore && document.getElementById('moore-machine').checked) {
            stateDict[key] = new Moore(value.initialX, value.initialY, value.id);
            if (value.text2 !== undefined) {
                stateDict[key].unparsedText2 = value.unparsedText2.replaceAll('\\\\', '\\');
                stateDict[key].text2.text(specialCharacter(stateDict[key].unparsedText2));
            }
        } else {
            stateDict[key] = new State(value.initialX, value.initialY, value.id);
        }

        if (document.getElementById('moore-machine').checked || document.getElementById("mealy-machine").checked) {
            if (value.finalState) {
                stateDict[key].finalState = false;
                stateDict[key].innerCircle.visible(false);
            }
        } else {
            if (value.finalState) {
                stateDict[key].finalState = true;
                stateDict[key].innerCircle.visible(true);
            }
        }
        if (value.initialState) {
            stateDict[key].toggleInitialState();
        }
        stateDict[key].unparsedText = value.unparsedText.replaceAll('\\\\', '\\');
        ;
        stateDict[key].text.text(specialCharacter(stateDict[key].unparsedText));
    }

    // Regenerate the transitions
    for (const [key, value] of Object.entries(save_state['transitions'])) {
        if (value.divider !== undefined && !switched) {
            document.getElementById('mealy-machine').checked = true;
            isMealyMoore = true;
        }

        if (!isMealyMoore && !switched) {
            document.getElementById('default-machine').checked = true;
        }

        let startState = stateDict[`state${JSON.parse(value.startState).attrs.id}`].state
        let endState = stateDict[`state${JSON.parse(value.endState).attrs.id}`].state

        if (document.getElementById("mealy-machine").checked) {
            transitionDict[key] = new Mealy(startState);
            if (value.text2 !== undefined) {
                transitionDict[key].unparsedText2 = value.unparsedText2.replaceAll('\\\\', '\\');
                transitionDict[key].text2.text(specialCharacter(transitionDict[key].unparsedText2));
            }
        } else {
            transitionDict[key] = new Transition(startState);
        }

        // Set the attributs of the transitions
        transitionDict[key].id = value.id;
        transitionDict[key].straightTransition = value.straightTransition;
        transitionDict[key].self_reference = value.self_reference;

        transitionDict[key].addEndState(endState);
        transitionDict[key].anchor.setAttrs(JSON.parse(value['anchor']).attrs);
        transitionDict[key].transition.setAttrs(JSON.parse(value.transition).attrs);

        if (value.self_reference) {
            transitionDict[key].anchor2.setAttrs(JSON.parse(value.anchor2).attrs);
            transitionDict[key].transition.tension(0.75);
            transitionDict[key].draggerDifference = value.draggerDifference;
            transitionDict[key].anchorAngle = value.anchorAngle;
            transitionDict[key].angleLine.setAttrs(JSON.parse(value.angleLine).attrs);
            transitionDict[key].angleDragger.setAttrs(JSON.parse(value.angleDragger).attrs);
        }

        transitionDict[key].unparsedText = value.unparsedText.replaceAll('\\\\', '\\');
        ;
        transitionDict[key].text.text(specialCharacter(transitionDict[key].unparsedText));

        if (!isMealyMoore) {
            if (transitionDict[key].text.text() === '_') {
                transitionDict[key].text.text('');
            }
        }

        transitionDict[key].setVisibility(false);
        transitionDict[key].updateText('');
        updateLines();
    }

    document.getElementById("diagram-title").value = title;
}


String.prototype.replaceAll = function (search, replacement) {
    // New function for replaing all occurrances of search with replacement in a string
    var target = this;
    return target.split(search).join(replacement);
};

// Add the default machine to the screen
beginningFrame();

// If the user is already logging in, keep a record of their machine
let loggingin = sessionStorage.getItem('loggingin')
if (sessionStorage.getItem('importing') === 'true') {
    let file = document.getElementById("load_file").value;
    if (file !== undefined || file !== '' || file !== null) {
        file = file.toString().slice(2, file.length - 1).replaceAll('\\\\"', '\\"'); // Don't ask why
        file = file.replaceAll('\\x', '\\\\x')
        sessionStorage.setItem('importing', 'false');
        regenerate(JSON.parse(file), "Untitled");
        clearHistory();
        update_history();
    }
} else if (loggingin !== 'false') {
    if (loggingin !== null) {
        regenerate(JSON.parse(loggingin), "Untitled");
    }
}

// Call the function to fit the machine to the canvas container
fitStageIntoParentContainer();
