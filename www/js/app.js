// When the document is ready
$(document).ready(function() {
	// Team constants
	var teamRed = 1;
	var teamGreen = 2;

	// tab constants
	var tabMyBoard = 1;
	var tabEnemyBoard = 2;

	// What team is who
	var myTeam = -1;
	var enemyTeam = -1;

	// What tab we are on
	var currentTab = tabMyBoard;

	// Function to change my current team
	function setMyTeam(newTeam) {
		myTeam = newTeam;

		$('#btnMeRed').removeClass('btn-danger');
		$('#btnMeGreen').removeClass('btn-success');

		if(myTeam == teamRed) $('#btnMeRed').addClass('btn-danger');
		if(myTeam == teamGreen) $('#btnMeGreen').addClass('btn-success');

		// Check if the match can start
		checkCanStart();
	}

	// Function to change the enmy team
	function setEnemyTeam(newTeam) {
		enemyTeam = newTeam;

		$('#btnEnemyRed').removeClass('btn-danger');
		$('#btnEnemyGreen').removeClass('btn-success');

		if(enemyTeam == teamRed) $('#btnEnemyRed').addClass('btn-danger');
		if(enemyTeam == teamGreen) $('#btnEnemyGreen').addClass('btn-success');

		// Check if the match can start
		checkCanStart();
	}

	// Checks if the match can start
	function checkCanStart() {
		if(enemyTeam != -1 && myTeam != -1) {
			$('#btnStartMatch').prop('disabled', false);
		}
	}

	// Starts the match
	function startMatch() {
		// The match is now active
		$('body').addClass('matchActive');

		// Activate my board
		setTab(tabMyBoard);

		// Reset the board
		resetBoards();
	}

	function resetBoards() {
		$('#myMainBoard').empty();
		$('#enemyMainBoard').empty();

		// Add my board
		addEmptyBoard($('#myMainBoard'), myTeam);
		addEmptyBoard($('#enemyMainBoard'), enemyTeam);
	}

	// Adds an empty board that can be filled out
	function addEmptyBoard(container, team) {
		var subContainer = $('<div>', {
			class: 'mainBoard'
		}).appendTo(container);

		$('<div>', {
			class: 'slot slotPlane'
		}).appendTo(subContainer);

		$('<div>', {
			class: 'slot slotCar'
		}).appendTo(subContainer);

		var slotContainer = $('<div>', {
			class: 'slotContainer'
		}).appendTo(subContainer);

		var boardStorage = {};

		for(var i=0; i<9; ++i) {
			addSlotContainer(slotContainer, i, team, boardStorage);
		}

		// Add the agent slot
		addSlotContainer(subContainer, -1, team, boardStorage);

		$('<div>', {
			class: 'slot slotBoat'
		}).appendTo(subContainer);
	}

	function addSlotContainer(container, slotNumber, team, boardStorage) {
		var squareWidth = 120;

		var xPos = slotNumber % 3 * squareWidth;
		var yPos = Math.floor(slotNumber / 3) * squareWidth + 100;

		// Your agent square
		if(slotNumber == -1) {
			xPos = 20;
			yPos = 6;
		}

		var theDiv = $('<div>', {
			class: 'slot',
			style: 'left: ' + xPos + 'px; top: ' + yPos + 'px;'
		}).appendTo(container);

		// Make this an agent select screen
		theDiv.click(function() {
			showAgentSelect(team, boardStorage[slotNumber], boardStorage, function(selectedAgent) {
				// Store it
				boardStorage[slotNumber] = selectedAgent;

				// Add the div
				agentIntoSlot(theDiv, selectedAgent);
			});
		});
	}

	function showAgentSelect(team, selectedAgent, boardStorage, callback) {
		$('#modalHeader').text('Select Agent');
		var modalBody = $('#modalBody');
		modalBody.empty();

		// List of taken agents
		var takenAgents = {};
		for(var agentId in boardStorage) {
			takenAgents[boardStorage[agentId]] = true;
		}

		// Loop over all characters
		for(var characterName in window.characterData) {
			var characterInfo = window.characterData[characterName];

			if(characterInfo.team == 'good' && team != teamGreen) continue;
			if(characterInfo.team == 'bad' && team != teamRed) continue;

			var thisDiv = $('<div>', {
				class: 'agentSelect',
				agentName: characterName,
				click: function() {
					// Close the modal
					$('#myModal').modal('hide');

					// Run the callback
					callback($(this).attr('agentName'));
				}
			}).appendTo(modalBody);

			// Add the agent into the slot
			agentIntoSlot(thisDiv, characterName);

			// Is this the currently selected agent?
			if(characterName == selectedAgent) {
				thisDiv.addClass('selectedAgent');
			} else if(takenAgents[characterName] != null) {
				// This agent is taken
				thisDiv.addClass('takenAgent');
			}
		}

		$('<button>', {
			class: 'btn btn-danger',
			text: 'Clear Slot',
			click: function() {
				// Close the modal
				$('#myModal').modal('hide');

				// They picked nothing, run callback
				callback(null);
			}
		}).appendTo(modalBody);

		$('#myModal').modal();
	}

	function agentIntoSlot(slot, characterName) {
		if(characterName == null) {
			slot.css('background-image', '');
		} else {
			slot.css('background-image', 'url(/images/characters/' + characterName + '.png)');
		}
	}

	// Sets the current tab
	function setTab(newTeam) {
		// Store it
		currentTab = newTeam;

		// remove CSS
		$('#btnTabMyBoard').removeClass('btn-primary');
		$('#btnTabEnemyBoard').removeClass('btn-primary');
		$('body').removeClass('activeTabMyBoard');
		$('body').removeClass('activeTabEnemyBoard');

		if(currentTab == tabMyBoard) {
			$('#btnTabMyBoard').addClass('btn-primary');
			$('body').addClass('activeTabMyBoard');
		}

		if(currentTab == tabEnemyBoard) {
			$('#btnTabEnemyBoard').addClass('btn-primary');
			$('body').addClass('activeTabEnemyBoard');
		}
	}

	// When they click "my team is red"
	$('#btnMeRed').click(function() {
		// Set my team to be red
		setMyTeam(teamRed);
	});

	// When they click "my team is green"
	$('#btnMeGreen').click(function() {
		// Set my team to be red
		setMyTeam(teamGreen);
	});

	// When they click "enemy team is red"
	$('#btnEnemyRed').click(function() {
		// Set my team to be red
		setEnemyTeam(teamRed);
	});

	// When they click "enemy team is green"
	$('#btnEnemyGreen').click(function() {
		// Set my team to be red
		setEnemyTeam(teamGreen);
	});

	// When the start math button is pressed
	$('#btnStartMatch').click(function() {
		// Starts the match
		startMatch();
	});

	// When they click the change tabs button
	$('#btnTabMyBoard').click(function() {
		setTab(tabMyBoard);
	});
	$('#btnTabEnemyBoard').click(function() {
		setTab(tabEnemyBoard);
	});

	setMyTeam(teamGreen);
	setEnemyTeam(teamRed);
	startMatch();
});
