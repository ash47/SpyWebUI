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
		addEmptyBoard($('#enemyMainBoard'), enemyTeam, $('#clueStorage'));
	}

	// Adds an empty board that can be filled out
	function addEmptyBoard(container, team, clueStorage) {
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

		// Storate for clues
		if(clueStorage != null) {
			var knownClues = {};

			var rebuildClueDisplay = function() {
				// Empty out the clue storage
				clueStorage.empty();

				var handledClues = {};

				// Loop over all characters
				for(var characterName in window.characterData) {
					var characterInfo = window.characterData[characterName];

					// Ensure this character is on the right team
					if(characterInfo.team == 'good' && team != teamGreen) continue;
					if(characterInfo.team == 'bad' && team != teamRed) continue;

					// Did we already handle this character?
					if(handledClues[characterName]) continue;

					// This agent is now handled
					handledClues[characterName] = true;

					// Add's a cluegrid for the given character
					addClueGrid(characterName, clueStorage, team);
				}
			}

			// Do the initial rebuild
			rebuildClueDisplay();
		}
	}

	// Adds a clue storage
	function addClueGrid(characterName, clueStorage, team) {
		var characterInfo = window.characterData[characterName];
		var moves = characterInfo.moves;

		var width = 1;
		var height = 1;
		var xPos = 0;
		var yPos = 0;

		var agentWidth = 120;
		var agentHeight = 120;

		if(moves.left) {
			++width;
			++xPos;
		}
		if(moves.right) ++width;
		if(moves.up) {
			++height;
			++yPos;
		}
		if(moves.down) ++height;

		var theWidth = width * agentWidth;
		var theHeight = height * agentHeight;
		var myClueStorage = $('<div>', {
			class: 'clueStorage',
			style: 'width: ' + theWidth + 'px; height: ' + theHeight + 'px;'
		}).appendTo(clueStorage);

		var thisDiv = $('<div>', {
			class: 'agentSelect clueAgent',
			agentName: characterName,
			style: 'left: ' + xPos * agentWidth + 'px; top: ' + yPos * agentHeight + 'px;'
		}).appendTo(myClueStorage);

		// Add the agent into the slot
		agentIntoSlot(thisDiv, characterName);

		// Add all the known/unknown moves
		for(var moveDirection in moves) {
			// Default to the middle
			var myX = xPos;
			var myY = yPos;

			if(moveDirection == 'left') --myX;
			if(moveDirection == 'right') ++myX;
			if(moveDirection == 'up') --myY;
			if(moveDirection == 'down') ++myY;

			var thisAgent = 'unknown';

			var moveSlot = $('<div>', {
				class: 'agentSelect clueAgent',
				agentName: thisAgent,
				style: 'left: ' + myX * agentWidth + 'px; top: ' + myY * agentHeight + 'px;',
				click: function() {
					var myBoardStorage = {
						[characterName]: true
					};

					// Build the question
					var textMessage = 'Who is ' + characterName + ' ' + moves[moveDirection] + 'ing ' + moveDirection + ' at?';

					// Show the selector
					showAgentSelect(team, null, myBoardStorage, textMessage, function(selectedAgent) {
						
					});
				}
			}).appendTo(myClueStorage);

			// Add the agent into the slot
			agentIntoSlot(moveSlot, thisAgent);
		}
	};

	function addSlotContainer(container, slotNumber, team, boardStorage, advancedMessage) {
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
			var textMessage = 'Nothing';

			if(boardStorage[slotNumber] != null) {
				textMessage = boardStorage[slotNumber];
			}

			if(advancedMessage != null) {
				textMessage = advancedMessage;
			}

			showAgentSelect(team, boardStorage[slotNumber], boardStorage, textMessage, function(selectedAgent) {
				// Store it
				boardStorage[slotNumber] = selectedAgent;

				// Add the div
				agentIntoSlot(theDiv, selectedAgent);
			});
		});
	}

	function showAgentSelect(team, selectedAgent, boardStorage, textMessage, callback) {
		$('#modalHeader').text('Select Agent');
		var modalBody = $('#modalBody');
		modalBody.empty();

		// Do we need to add a text message?
		if(textMessage != null) {
			var sectionContiner = $('<div>', {
				class: 'messageContainer'
			}).appendTo(modalBody);

			$('<input>', {
				class: 'form-control clipboardTemp',
				val: textMessage,
				disabled: true,
				'data-clipboard-text': textMessage
			}).appendTo(sectionContiner);

			$('<button>', {
				class: 'btn btn-primary clipboardTemp',
				text: 'Copy',
				'data-clipboard-text': textMessage
			}).appendTo(sectionContiner);

			$('<br>').appendTo(modalBody);

			new Clipboard('.clipboardTemp', {
				container: document.getElementById('myModal')
			});
		}

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
	setTab(tabEnemyBoard);
});
