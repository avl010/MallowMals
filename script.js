function getFormattedDate(format = 'MM/DD') {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
    if (format === 'Month DD') return now.toLocaleString(undefined, { month: 'long' }) + ' ' + dd;
    // default: MM/DD
    return `${mm}/${dd}`;
}

document.addEventListener("DOMContentLoaded", function () {
    let resultPage = document.getElementById("result-page");

    // Set header(s) to current date on load
    const dateText = getFormattedDate('MM/DD');
    const header = document.getElementById("header");
    const header1 = document.getElementById("header1");
    if (header) {
        header.textContent = dateText;
        header.style.color = '#fff';
        header.style.backgroundColor = 'rgb(22, 22, 22)';
    }
    if (header1) {
        header1.textContent = dateText;
        header1.style.color = 'var(--8-color)';
        header1.style.backgroundColor = 'rgb(22, 22, 22)';
    }

    function checkAndTriggerGif() {
        if (resultPage.style.display !== "none") { 
            let randomInterval = Math.floor(Math.random() * 70000) + 10000;
            setTimeout(showFloatingGif, randomInterval); 
        }
    }

    let observer = new MutationObserver(checkAndTriggerGif);
    if (resultPage) observer.observe(resultPage, { attributes: true, attributeFilter: ["style"] });

    let style = document.createElement("style");
    style.innerHTML = `
        @keyframes floatUpDown {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); } /* Moves up */
            100% { transform: translateY(0px); } /* Moves back down */
        }
    `;
    document.head.appendChild(style);
});



document.getElementById('start1-button').addEventListener('click', function () {
    const popSound = document.getElementById('popSound');
    if (popSound) popSound.play();
    document.getElementById('start-page').style.display = 'none';
    document.getElementById('interm').style.display = 'flex';
});

document.getElementById('start-button').addEventListener('click', function () {
    const notifSound = document.getElementById('notifSound');
    if (notifSound) notifSound.play();
    document.getElementById('interm').style.display = 'none';
    document.getElementById('phone-screen').style.display = 'flex';
});

let currentMessageIndex = 0;
// New score system for the six characters
const scores = {
  crumbs: 0,   // 🐻 Crumbs (bear) — calm, responsible, prepared
  bits: 0,     // 🐸 Bits (frog) — chaotic, impulsive, goofy
  puffs: 0,    // 🐰 Puffs (bunny) — gentle, timid, cozy
  flakes: 0,   // 🐯 Flakes (tiger) — bold, competitive, energetic
  nibs: 0,     // 🐱 Nibs (cat) — curious, picky, mischievous
  pebbles: 0   // 🦆 Pebbles (duck) — sleepy, distracted, dramatic
};

const dialogue = [
  // Prompt 1 (0)
  {
    speaker: "bot",
    text: ["*New notification from Unknown User*"],
    choices: [
      { id: 1, text: "open it", type: null, weight: 0, next: 2, followUpText: [] },
      { id: 2, text: "ignore it", type: null, weight: 0, next: 1, followUpText: [] }
    ]
  },

  // Prompt 2 (1)
  {
    speaker: "bot",
    text: ["*Are you sure?*"],
    choices: [{ id: 1, text: "ok fine", type: null, weight: 0, next: 2, followUpText: [] }]
  },

  // Prompt 3 (2)
  {
    speaker: "bot",
    text: ["Hey there!", "Congrats! You just unlocked a blind box!"],
    choices: [
      { id: 1, text: "i think you got the wrong number", type: null, weight: 0, next: 3, followUpText: [] },
      { id: 2, text: "who is this?", type: null, weight: 0, next: 4, followUpText: [] },
      { id: 3, text: "don’t reply, it could be a scam!", type: null, weight: 0, next: 5, followUpText: [] }
    ]
  },

  // Prompt 4 (3)
  {
    speaker: "bot",
    text: ["This is the right number!", "Take a quiz to reveal your blind box!"],
    choices: [
      { id: 1, text: "how’d you even get my number?? ok whatever", type: null, weight: 0, next: 8, followUpText: [] }, // start quiz -> index 8
      { id: 2, text: "quiz?", type: null, weight: 0, next: 6, followUpText: [] }, // go to explanation
      { id: 3, text: "uh alright then", type: null, weight: 0, next: 8, followUpText: [] }
    ]
  },

  // Prompt 5 (4) — UPDATED
  {
    speaker: "bot",
    text: ["This is MallowMals!", "You tapped on me, remember?", "Take a quiz to reveal your blind box!"],
    choices: [
      { id: 1, text: "you’re the physical blind box?? ok then", type: null, weight: 0, next: 8, followUpText: [] }, // start quiz -> index 8
      { id: 2, text: "quiz?", type: null, weight: 0, next: 6, followUpText: [] }, // explanation
      { id: 3, text: "oh awesome ok lets start", type: null, weight: 0, next: 8, followUpText: [] }
    ]
  },

  // Prompt 6 (5) — UPDATED
  {
    speaker: "bot",
    text: ["This is definitely not a scam", "Take a quiz to reveal your blind box!"],
    choices: [
      { id: 1, text: "how’d you know what I was thinking?? sure then…", type: null, weight: 0, next: 8, followUpText: [] }, // start quiz -> index 8
      { id: 2, text: "quiz?", type: null, weight: 0, next: 6, followUpText: [] }, // explanation
      { id: 3, text: "don’t reply, you still think it’s a scam", type: null, weight: 0, next: 7, followUpText: [] } // reassurance
    ]
  },

  // Prompt 7 (6) - quiz explanation
  {
    speaker: "bot",
    text: [
      "This is a personality quiz to explore what choices you’ll make in certain situations!",
      "You’ll be revealed a character based on your answers",
      "Interested?"
    ],
    choices: [
      { id: 1, text: "let’s do it!", type: null, weight: 0, next: 8, followUpText: [] }, // start quiz -> index 8
      { id: 2, text: "yeah sounds interesting!", type: null, weight: 0, next: 8, followUpText: [] }
    ]
  },

  // Prompt 8 (7) - reassurance for scam concerns
  {
    speaker: "bot",
    text: ["No seriously this isn’t a scam trust", "Aren’t you curious what you’ll get?"],
    choices: [{ id: 1, text: "ok i’ll take the quiz", type: null, weight: 0, next: 8, followUpText: [] }]
  },

  // Q1 (8) — QUIZ START (ensure this is at index 8)
  {
    speaker: "bot",
    text: ["Q1) Your alarm goes off. What’s your first reaction?"],
    choices: [
      { id: 1, text: "Stay in bed for another five minutes.", type: "pebbles", weight: 2, next: 9, followUpText: [] },
      { id: 2, text: "Immediately get out of bed.", type: "flakes", weight: 2, next: 9, followUpText: [] },
      { id: 3, text: "You feel groggy and half asleep.", type: "pebbles", type2: "bits", weight: 1, next: 9, followUpText: [] },
      { id: 4, text: "You check your phone.", type: "nibs", type2: "puffs", weight: 1, next: 9, followUpText: [] }
    ]
  },

  // Q2 (9)
  {
    speaker: "bot",
    text: ["Q2) You head into the kitchen. What is it looking like?"],
    choices: [
      { id: 1, text: "Quiet and tidy, with curtains open.", type: "puffs", weight: 2, next: 10, followUpText: [] },
      { id: 2, text: "Lights on with music playing.", type: "flakes", weight: 2, next: 10, followUpText: [] },
      { id: 3, text: "Messy counters with crumbs everywhere.", type: "bits", weight: 2, next: 10, followUpText: [] },
      { id: 4, text: "Lights off, cluttered mugs, with curtains closed.", type: "puffs", type2: "pebbles", weight: 1, next: 10, followUpText: [] }
    ]
  },

  // Q3 (10)
  {
    speaker: "bot",
    text: ["Q3) You open the cabinet and see three different cereal boxes. What do you do?"],
    choices: [
      { id: 1, text: "Carefully consider each option before choosing.", type: "crumbs", weight: 2, next: 11, followUpText: [] },
      { id: 2, text: "Grab the closest one without thinking.", type: "pebbles", type2: "bits", weight: 1, next: 11, followUpText: [] },
      { id: 3, text: "Mix two together just to see what happens.", type: "nibs", weight: 2, next: 11, followUpText: [] },
      { id: 4, text: "Give up and switch to toast instead.", type: "pebbles", weight: 2, next: 11, followUpText: [] }
    ]
  },

  // Q4 (11)
  {
    speaker: "bot",
    text: ["Q4) This is very important. What goes into the bowl first?"],
    choices: [
      { id: 1, text: '"Cereal first."', type: "crumbs", weight: 2, next: 12, followUpText: [] },
      { id: 2, text: '"Milk first."', type: "bits", weight: 2, next: 12, followUpText: [] },
      { id: 3, text: '"Honestly? Depends on the day."', type: "nibs", weight: 2, next: 12, followUpText: [] },
      { id: 4, text: '"Whichever. I don’t really think about it."', type: "bits", type2: "pebbles", weight: 1, next: 12, followUpText: [] }
    ]
  },

  // Q5 (12)
  {
    speaker: "bot",
    text: ["Q5) The cereal starts getting soggy faster than expected. What do you do?"],
    choices: [
      { id: 1, text: "Eat it quickly before it gets worse.", type: "flakes", type2: "crumbs", weight: 1, next: 13, followUpText: [] },
      { id: 2, text: "Accept it and keep eating.", type: "puffs", weight: 2, next: 13, followUpText: [] },
      { id: 3, text: "Get annoyed that it got soggier.", type: "pebbles", type2: "bits", weight: 1, next: 13, followUpText: [] },
      { id: 4, text: "Add more cereal to fix it.", type: "nibs", weight: 2, next: 13, followUpText: [] }
    ]
  },

  // Q6 (13)
  {
    speaker: "bot",
    text: ["Q6) You sit down with your bowl and realize there’s no spoon nearby. What do you do?"],
    choices: [
      { id: 1, text: "Get up and grab a spoon.", type: "crumbs", weight: 2, next: 14, followUpText: [] },
      { id: 2, text: "Use a fork instead.", type: "bits", weight: 2, next: 14, followUpText: [] },
      { id: 3, text: "Try drinking the milk from the bowl.", type: "nibs", weight: 2, next: 14, followUpText: [] },
      { id: 4, text: "Stare at the bowl for a few seconds before moving.", type: "pebbles", weight: 2, next: 14, followUpText: [] }
    ]
  },

  // Q7 (14)
  {
    speaker: "bot",
    text: ["Q7) Halfway through, you spill some milk on the counter. What do you do?"],
    choices: [
      { id: 1, text: "Calmly clean it up right away.", type: "crumbs", weight: 2, next: 15, followUpText: [] },
      { id: 2, text: "Leave it for later.", type: "pebbles", type2: "puffs", weight: 1, next: 15, followUpText: [] },
      { id: 3, text: "Grab towels quickly and accidentally make a bigger mess in the process.", type: "flakes", type2: "bits", weight: 1, next: 15, followUpText: [] },
      { id: 4, text: "Ignore it and keep eating.", type: "bits", weight: 2, next: 15, followUpText: [] }
    ]
  },

  // Q8 (15)
  {
    speaker: "bot",
    text: ["Q8) Someone else walks in and looks at your bowl. What do you do?"],
    choices: [
      { id: 1, text: "Offer to share some.", type: "puffs", weight: 2, next: 16, followUpText: [] },
      { id: 2, text: "Guard the bowl protectively.", type: "crumbs", type2: "bits", weight: 1, next: 16, followUpText: [] },
      { id: 3, text: "Ask what they are eating instead.", type: "nibs", weight: 2, next: 16, followUpText: [] },
      { id: 4, text: "Avoid eye contact and continue eating.", type: "pebbles", weight: 2, next: 16, followUpText: [] }
    ]
  },

  // Q9 (16)
  {
    speaker: "bot",
    text: ["Q9) You’re almost done. What’s left in the bowl?"],
    choices: [
      { id: 1, text: "Mostly milk remains.", type: "crumbs", type2: "puffs", weight: 1, next: 17, followUpText: [] },
      { id: 2, text: "Nothing at all. Cereal devoured.", type: "crumbs", weight: 2, next: 17, followUpText: [] },
      { id: 3, text: "A soggy clump of cereal at the bottom.", type: "pebbles", type2: "bits", weight: 1, next: 17, followUpText: [] },
      { id: 4, text: "Scattered crumbs.", type: "bits", weight: 2, next: 17, followUpText: [] }
    ]
  },

  // Q10 (17)
  {
    speaker: "bot",
    text: ["Q10) Do you drink the leftover milk?"],
    choices: [
      { id: 1, text: '"yeah, obviously."', type: "crumbs", weight: 2, next: 18, followUpText: [] },
      { id: 2, text: '"sometimes. Depends."', type: "puffs", type2: "nibs", weight: 1, next: 18, followUpText: [] },
      { id: 3, text: '"absolutely not."', type: "bits", weight: 2, next: 18, followUpText: [] },
      { id: 4, text: '"……maybe."', type: "pebbles", weight: 2, next: 18, followUpText: [] }
    ]
  },

  // Q11 (18)
  {
    speaker: "bot",
    text: ["Q11) You glance at the clock and realize you’re running late. What do you do?"],
    choices: [
      { id: 1, text: "Finish eating, get fully ready, and leave calmly.", type: "crumbs", weight: 2, next: 19, followUpText: [] },
      { id: 2, text: "Take the bowl with you while getting ready.", type: "flakes", weight: 2, next: 19, followUpText: [] },
      { id: 3, text: "Leave the kitchen immediately without finishing or getting ready.", type: "pebbles", weight: 2, next: 19, followUpText: [] },
      { id: 4, text: "Rush through eating and make a mess trying to get ready at the same time.", type: "bits", weight: 2, next: 19, followUpText: [] }
    ]
  },

  // Q12 (19)
  {
    speaker: "bot",
    text: ["Q12) Right before heading out, what do you do?"],
    choices: [
      { id: 1, text: "Double-check that you didn’t forget anything.", type: "crumbs", weight: 2, next: 20, followUpText: [] },
      { id: 2, text: "Mentally plan the rest of the day.", type: "flakes", type2: "nibs", weight: 1, next: 20, followUpText: [] },
      { id: 3, text: "Step around the mess and head out anyway.", type: "bits", type2: "pebbles", weight: 1, next: 20, followUpText: [] },
      { id: 4, text: "Linger for a second before leaving.", type: "puffs", weight: 2, next: 20, followUpText: [] }
    ]
  },

  // Final prompt (20)
  {
    speaker: "bot",
    text: ["Thanks for answering! Ready to reveal your blind box?"],
    choices: [{ id: 1, text: "YES!", type: "O", weight: 0, next: 100, followUpText: [] }]
  }
];

function addMessage(speaker, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', speaker);
    // if an array passed, join with newline
    if (Array.isArray(text)) {
        messageElement.textContent = text.join(' ');
    } else {
        messageElement.textContent = text;
    }
    document.getElementById('chatbox').appendChild(messageElement);
    document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
}

function showChoices(choices) {
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';

    choices.forEach(choice => {
        const choiceButton = document.createElement('button');
        choiceButton.classList.add('choice-button');
        choiceButton.textContent = choice.text;
        choiceButton.onclick = () => handleChoice(choice.type, choice.type2, choice.type3, choice.weight, choice.id, choice.next);
        choicesContainer.appendChild(choiceButton);
    });
}

let typingInterval;
let typingDots = 0;

function showTypingDots() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.textContent = 'typing...';
    document.getElementById('chatbox').appendChild(typingIndicator);
    typingIndicator.style.display = 'inline';

    typingDots = 0;

    typingInterval = setInterval(() => {
        typingIndicator.textContent = '.'.repeat(typingDots % 5);
        typingDots++;
    }, 250);
}

function stopTypingDots() {
    clearInterval(typingInterval);
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function displayResult() {
    // Determine the highest score(s)
    const entries = Object.entries(scores); // [ [key, value], ... ]
    let maxScore = -Infinity;
    entries.forEach(([k, v]) => { if (v > maxScore) maxScore = v; });

    // gather top keys (handle ties)
    let topKeys = entries.filter(([k, v]) => v === maxScore).map(([k]) => k);

    // pick random among ties
    const chosenKey = topKeys[Math.floor(Math.random() * topKeys.length)];

    // Map keys to display names and images (update image filenames as needed)
    const resultsText = {
        crumbs: 'crumbs — calm, responsible, prepared',
        bits: 'bits — chaotic, impulsive, goofy',
        puffs: 'puffs — gentle, timid, cozy',
        flakes: 'flakes — bold, competitive, energetic',
        nibs: 'nibs — curious, picky, mischievous',
        pebbles: 'pebbles — sleepy, distracted, dramatic'
    };

    const resultImages = {
        crumbs: '1.png',
        bits: '2.png',
        puffs: '3.png',
        flakes: '4.png',
        nibs: '5.png',
        pebbles: '6.png'
    };

    document.getElementById("phone-screen").style.display = "none";
    document.getElementById("result-page").style.display = "flex";
    document.getElementById("result-image").src = "IMG/" + resultImages[chosenKey];
    document.getElementById("result-image").alt = chosenKey + " " + (resultsText[chosenKey] || '');
    document.getElementById("result-text").textContent = resultsText[chosenKey] || '';
}

function handleChoice(type, type2, type3, weight, id, nextIndex) {
    const dingSound = document.getElementById('dingSound');
    if (dingSound) dingSound.play();

    const currentDialogue = dialogue[currentMessageIndex];
    // find chosen option by id (safer if type null)
    const chosenOption = currentDialogue.choices.find(choice => choice.id === id);

    // Only add to scores for defined types
    if (type && scores.hasOwnProperty(type)) scores[type] += (weight || 0);
    if (type2 && scores.hasOwnProperty(type2)) scores[type2] += (weight || 0);
    if (type3 && scores.hasOwnProperty(type3)) scores[type3] += (weight || 0);

    updateDebugScores();
    currentMessageIndex = nextIndex;
    document.getElementById('choices').innerHTML = '';

    addMessage('user', chosenOption.text);

    if (chosenOption.followUpText && chosenOption.followUpText.length > 0) {
        chosenOption.followUpText.forEach((followUp, index) => {
            setTimeout(() => {
                addMessage('user', followUp);
            }, (index + 1) * 1000);
        });
    }

    setTimeout(() => {
        showTypingDots();

        setTimeout(() => {
            stopTypingDots();
            const popSound = document.getElementById('popSound');
            if (popSound) popSound.play();
            if (currentMessageIndex == 0 || currentMessageIndex == 2 || currentMessageIndex >=3 ) {
                const header = document.getElementById("header");
                if (header) {
                    // show current date instead of the literal "Unknown"
                    header.textContent = getFormattedDate('MM/DD');
                    header.style.color = 'var(--6-color)';
                    header.style.backgroundColor = 'var(--2-color)';
                }
                const phoneScreen = document.getElementById("phone-screen");
                if (phoneScreen) phoneScreen.style.backgroundColor = '#fff';
            }

            if (currentMessageIndex >= 6) {
                const header = document.getElementById("header");
                if (header) {
                    header.textContent = getFormattedDate('MM/DD'); // use current date
                    header.style.color = 'var(--6-color)';
                }
            }

            if (currentMessageIndex < dialogue.length) {
                const currentDialogue2 = dialogue[currentMessageIndex];
                currentDialogue2.text.forEach((text, index) => {
                    setTimeout(() => {
                        addMessage(currentDialogue2.speaker, text);
                    }, index * 1000);
                });
                setTimeout(() => {
                    showChoices(currentDialogue2.choices);
                }, currentDialogue2.text.length * 1000);

            }
            else {
                triggerIconShower();
                displayResult();
            }

        }, 1500);
    }, (chosenOption.followUpText.length * 1000) + 500);
}

function restartQuiz() {
    document.getElementById("result-page").style.display = "none";
    document.getElementById("start-page").style.display = "flex";
    currentMessageIndex = 0;
    // reset scores for new system
    scores.crumbs = scores.bits = scores.puffs = scores.flakes = scores.nibs = scores.pebbles = 0;
    document.getElementById('chatbox').innerHTML = '';
    document.getElementById('choices').innerHTML = '';
    const header = document.getElementById("header");
    if (header) {
        header.textContent = getFormattedDate('MM/DD');
        header.style.color = '#fff';
        header.style.backgroundColor = 'rgb(22, 22, 22)';
    }
    const phoneScreen = document.getElementById("phone-screen");
    if (phoneScreen) phoneScreen.style.backgroundColor = 'rgb(22, 22, 22)';
    startConversation();
}

function startConversation() {
    // show the first dialogue texts and choices
    const first = dialogue[0];
    first.text.forEach((t, i) => setTimeout(() => addMessage(first.speaker, t), i * 400));
    setTimeout(() => showChoices(first.choices), first.text.length * 400);
}

function updateDebugScores() {
    const debugScoresElement = document.getElementById('debug-scores');
    const formattedScores = `
    ${currentMessageIndex+1}
crumbs: ${scores.crumbs}, bits: ${scores.bits}, puffs: ${scores.puffs},
flakes: ${scores.flakes}, nibs: ${scores.nibs}, pebbles: ${scores.pebbles}`;
    if (debugScoresElement) debugScoresElement.textContent = formattedScores.trim();
}

function save() {
    const resultImg = document.getElementById("result-image");
    const imgSrc = resultImg.src;

    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = imgSrc.split("/").pop(); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function triggerIconShower(event) {
    for (let i = 0; i < 15; i++) {
        const icon = document.createElement('div');
        icon.classList.add('icon');

        const iconContent = Math.random() > 0.5 ? '♥' : '★';
        icon.textContent = iconContent;


        if (iconContent === '♥') {
            icon.classList.add('heart');
        }
        else {
            icon.classList.add('star');
        }


        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        icon.style.left = `${x}px`;
        icon.style.top = `${y}px`;


        document.body.appendChild(icon);


        setTimeout(() => {
            icon.remove();
        }, 3000);
    }
}

startConversation();