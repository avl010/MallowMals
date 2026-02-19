import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function getFormattedDate(format = 'MM/DD') {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
    if (format === 'Month DD') return now.toLocaleString(undefined, { month: 'long' }) + ' ' + dd;
    return `${mm}/${dd}`;
}

document.addEventListener("DOMContentLoaded", function () {
    let resultPage = document.getElementById("result-page");

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
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
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

const scores = {
    crumbs: 0,
    bits: 0,
    puffs: 0,
    flakes: 0,
    nibs: 0,
    pebbles: 0
};

// ========== THREE.JS SETUP ==========
let scene, camera, renderer, currentModel, controls;

function initThreeJS() {
    const container = document.getElementById('model-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 3;
    controls.maxDistance = 10;

    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function createCharacterModel(characterType) {
    if (currentModel) {
        scene.remove(currentModel);
    }

    const modelMap = {
        crumbs:  "3dmodels/crumbs.glb",
        bits:    "3dmodels/bits.glb",
        puffs:   "3dmodels/puffs.glb",
        flakes:  "3dmodels/flakes.glb",
        nibs:    "3dmodels/nibs.glb",
        pebbles: "3dmodels/pebbles.glb"
    };

    const modelPath = modelMap[characterType];
    if (!modelPath) return;

    const loader = new GLTFLoader();

    loader.load(
        modelPath,
        function (gltf) {
            currentModel = gltf.scene;

            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            currentModel.position.sub(center);

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            currentModel.scale.setScalar(scale);

            scene.add(currentModel);

            currentModel.scale.set(0, 0, 0);
            const targetScale = scale;
            let s = 0;
            const animate = () => {
                s += 0.05;
                if (s <= 1) {
                    currentModel.scale.setScalar(targetScale * s);
                    requestAnimationFrame(animate);
                } else {
                    currentModel.scale.setScalar(targetScale);
                }
            };
            animate();
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading model:', error);
        }
    );
}

// ========== DIALOGUE ==========
const dialogue = [
    {
        speaker: "bot",
        text: ["*New notification from Unknown User*"],
        choices: [
            { id: 1, text: "open it", type: null, weight: 0, next: 2, followUpText: [] },
            { id: 2, text: "ignore it", type: null, weight: 0, next: 1, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["*Are you sure?*"],
        choices: [{ id: 1, text: "ok fine", type: null, weight: 0, next: 2, followUpText: [] }]
    },
    {
        speaker: "bot",
        text: ["Hey there!", "Congrats! You just unlocked a blind box!"],
        choices: [
            { id: 1, text: "i think you got the wrong number", type: null, weight: 0, next: 3, followUpText: [] },
            { id: 2, text: "who is this?", type: null, weight: 0, next: 4, followUpText: [] },
            { id: 3, text: "don't reply, it could be a scam!", type: null, weight: 0, next: 5, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["This is the right number!", "Take a quiz to reveal your blind box!"],
        choices: [
            { id: 1, text: "how'd you even get my number?? ok whatever", type: null, weight: 0, next: 8, followUpText: [] },
            { id: 2, text: "quiz?", type: null, weight: 0, next: 6, followUpText: [] },
            { id: 3, text: "uh alright then", type: null, weight: 0, next: 8, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["This is MallowMals!", "You tapped on me, remember?", "Take a quiz to reveal your blind box!"],
        choices: [
            { id: 1, text: "you're the physical blind box?? ok then", type: null, weight: 0, next: 8, followUpText: [] },
            { id: 2, text: "quiz?", type: null, weight: 0, next: 6, followUpText: [] },
            { id: 3, text: "oh awesome ok lets start", type: null, weight: 0, next: 8, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["This is definitely not a scam", "Take a quiz to reveal your blind box!"],
        choices: [
            { id: 1, text: "how'd you know what I was thinking?? sure then…", type: null, weight: 0, next: 8, followUpText: [] },
            { id: 2, text: "quiz?", type: null, weight: 0, next: 6, followUpText: [] },
            { id: 3, text: "don't reply, you still think it's a scam", type: null, weight: 0, next: 7, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "This is a personality quiz to explore what choices you'll make in certain situations!",
            "You'll be revealed a character based on your answers",
            "Interested?"
        ],
        choices: [
            { id: 1, text: "let's do it!", type: null, weight: 0, next: 8, followUpText: [] },
            { id: 2, text: "yeah sounds interesting!", type: null, weight: 0, next: 8, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["No seriously this isn't a scam trust", "Aren't you curious what you'll get?"],
        choices: [{ id: 1, text: "ok i'll take the quiz", type: null, weight: 0, next: 8, followUpText: [] }]
    },
    {
        speaker: "bot",
        text: ["Q1) Your alarm goes off. What's your first reaction?"],
        choices: [
            { id: 1, text: "You stay in bed for another five minutes.", type: "pebbles", weight: 2, next: 9, followUpText: [] },
            { id: 2, text: "You immediately get out of bed.", type: "flakes", weight: 2, next: 9, followUpText: [] },
            { id: 3, text: "You sit up feeling groggy.", type: "pebbles", type2: "bits", weight: 1, next: 9, followUpText: [] },
            { id: 4, text: "You check your phone.", type: "nibs", type2: "puffs", weight: 1, next: 9, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["Q2) You head into the kitchen. What is it looking like?"],
        choices: [
            { id: 1, text: "Quiet and tidy, with curtains open.", type: "puffs", weight: 2, next: 10, followUpText: [] },
            { id: 2, text: "Lights on with music playing.", type: "flakes", weight: 2, next: 10, followUpText: [] },
            { id: 3, text: "Messy counters with crumbs everywhere.", type: "bits", weight: 2, next: 10, followUpText: [] },
            { id: 4, text: "Lights off, cluttered mess, with curtains closed.", type: "puffs", type2: "pebbles", weight: 1, next: 10, followUpText: [] }
        ]
    },
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
    {
        speaker: "bot",
        text: ["Q4) This is very important. What goes into the bowl first?"],
        choices: [
            { id: 1, text: "Cereal first.", type: "crumbs", weight: 2, next: 12, followUpText: [] },
            { id: 2, text: "Milk first.", type: "bits", weight: 2, next: 12, followUpText: [] },
            { id: 3, text: "Depends on the day.", type: "nibs", weight: 2, next: 12, followUpText: [] },
            { id: 4, text: "Whichever, it doesn't matter.", type: "bits", type2: "pebbles", weight: 1, next: 12, followUpText: [] }
        ]
    },
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
    {
        speaker: "bot",
        text: ["Q6) You sit down with your bowl and realize there's no spoon nearby. What do you do?"],
        choices: [
            { id: 1, text: "Get up and grab a spoon.", type: "crumbs", weight: 2, next: 14, followUpText: [] },
            { id: 2, text: "Use a fork instead.", type: "bits", weight: 2, next: 14, followUpText: [] },
            { id: 3, text: "Try drinking the milk from the bowl.", type: "nibs", weight: 2, next: 14, followUpText: [] },
            { id: 4, text: "Stare at the bowl for a few seconds before doing anything.", type: "pebbles", weight: 2, next: 14, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["Q7) Halfway through, you spill some milk on the counter. What do you do?"],
        choices: [
            { id: 1, text: "Calmly clean it up right away.", type: "crumbs", weight: 2, next: 15, followUpText: [] },
            { id: 2, text: "Leave it for later.", type: "pebbles", type2: "puffs", weight: 1, next: 15, followUpText: [] },
            { id: 3, text: "Quickly grab towels and somehow accidentally make a bigger mess in the process.", type: "flakes", type2: "bits", weight: 1, next: 15, followUpText: [] },
            { id: 4, text: "Ignore it and keep eating.", type: "bits", weight: 2, next: 15, followUpText: [] }
        ]
    },
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
    {
        speaker: "bot",
        text: ["Q9) You're almost done. What's left in the bowl?"],
        choices: [
            { id: 1, text: "Mostly milk remains.", type: "crumbs", type2: "puffs", weight: 1, next: 17, followUpText: [] },
            { id: 2, text: "Nothing at all. Cereal devoured.", type: "crumbs", weight: 2, next: 17, followUpText: [] },
            { id: 3, text: "A soggy clump of cereal at the bottom.", type: "pebbles", type2: "bits", weight: 1, next: 17, followUpText: [] },
            { id: 4, text: "Scattered crumbs.", type: "bits", weight: 2, next: 17, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["Q10) Do you drink the leftover milk?"],
        choices: [
            { id: 1, text: "Yes.", type: "crumbs", weight: 2, next: 18, followUpText: [] },
            { id: 2, text: "Sometimes. Depends.", type: "puffs", type2: "nibs", weight: 1, next: 18, followUpText: [] },
            { id: 3, text: "No.", type: "bits", weight: 2, next: 18, followUpText: [] },
            { id: 4, text: "……Maybe.", type: "pebbles", weight: 2, next: 18, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["Q11) You glance at the clock and realize you're running late. What do you do?"],
        choices: [
            { id: 1, text: "Finish eating, get fully ready, and leave calmly.", type: "crumbs", weight: 2, next: 19, followUpText: [] },
            { id: 2, text: "Take the bowl with you while getting ready.", type: "flakes", weight: 2, next: 19, followUpText: [] },
            { id: 3, text: "Leave the kitchen immediately without finishing or getting ready.", type: "pebbles", weight: 2, next: 19, followUpText: [] },
            { id: 4, text: "Rush through eating and make a mess trying to get ready at the same time.", type: "bits", weight: 2, next: 19, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["Q12) Right before heading out, what do you do?"],
        choices: [
            { id: 1, text: "Double-check that you didn't forget anything.", type: "crumbs", weight: 2, next: 20, followUpText: [] },
            { id: 2, text: "Mentally plan the rest of the day.", type: "flakes", type2: "nibs", weight: 1, next: 20, followUpText: [] },
            { id: 3, text: "Nothing. You head right out.", type: "bits", type2: "pebbles", weight: 1, next: 20, followUpText: [] },
            { id: 4, text: "Linger for a second before leaving.", type: "puffs", weight: 2, next: 20, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["Thanks for answering! Ready to reveal your blind box?"],
        choices: [{ id: 1, text: "YES!", type: "O", weight: 0, next: 100, followUpText: [] }]
    }
];

// ========== CHAT FUNCTIONS ==========
function addMessage(speaker, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', speaker);
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

// ========== BLIND BOX UNBOXING ==========
let tapCount = 0;
const tapsRequired = 3;

function showBlindBoxPage() {
    document.getElementById("phone-screen").style.display = "none";
    document.getElementById("blindbox-page").style.display = "flex";

    tapCount = 0;
    document.getElementById("blindbox-counter").textContent = "0 / " + tapsRequired;
    document.getElementById("blindbox-prompt").textContent = "Tap the blind box to open it!";
    document.getElementById("blindbox-reveal-button").style.display = "none";
    document.getElementById("blindbox-img").style.display = "block";
    document.getElementById("blindbox-img").style.pointerEvents = "auto";
}

function tapBlindBox() {
    const box = document.getElementById("blindbox-img");
    const counter = document.getElementById("blindbox-counter");
    const prompt = document.getElementById("blindbox-prompt");
    const revealBtn = document.getElementById("blindbox-reveal-button");

    const popSound = document.getElementById('popSound');
    if (popSound) popSound.play();

    box.classList.remove("shake");
    void box.offsetWidth;
    box.classList.add("shake");

    tapCount++;
    counter.textContent = tapCount + " / " + tapsRequired;

    if (tapCount === 1) {
        prompt.textContent = "Something's moving inside...";
    } else if (tapCount === 2) {
        prompt.textContent = "Almost there...!";
    }

    if (tapCount >= tapsRequired) {
        box.style.pointerEvents = "none";
        prompt.textContent = "Your blind box is ready!";
        counter.textContent = "";

        triggerIconShower();

        setTimeout(() => {
            revealBtn.style.display = "inline-block";
        }, 600);
    }
}

function revealResult() {
    const popSound = document.getElementById('popSound');
    if (popSound) popSound.play();

    document.getElementById("blindbox-page").style.display = "none";
    triggerIconShower();
    displayResult();
}

// ========== 3D TOGGLE ==========
let threeJSInitialized = false;
let currentCharacterKey = null;

function toggle3DView() {
    const image = document.getElementById('result-image');
    const modelContainer = document.getElementById('model-container');
    const toggleButton = document.getElementById('toggle-3d-button');

    if (!modelContainer || !image || !toggleButton) return;

    const showing3D = modelContainer.style.display !== 'none';

    if (showing3D) {
        modelContainer.style.display = 'none';
        image.style.display = 'block';
        toggleButton.textContent = 'See character in 3D';
    } else {
        image.style.display = 'none';
        modelContainer.style.display = 'block';
        toggleButton.textContent = 'See character as image';

        if (!threeJSInitialized) {
            setTimeout(() => {
                initThreeJS();
                createCharacterModel(currentCharacterKey);
                threeJSInitialized = true;
            }, 100);
        }
    }
}

// ========== DISPLAY RESULT ==========
function displayResult() {
    const entries = Object.entries(scores);
    let maxScore = -Infinity;
    entries.forEach(([k, v]) => { if (v > maxScore) maxScore = v; });

    let topKeys = entries.filter(([k, v]) => v === maxScore).map(([k]) => k);
    const chosenKey = topKeys[Math.floor(Math.random() * topKeys.length)];
    currentCharacterKey = chosenKey;

    const imageMap = {
        crumbs:  "charactercards/crumbs.png",
        bits:    "charactercards/bits.png",
        puffs:   "charactercards/puffs.png",
        flakes:  "charactercards/flakes.png",
        nibs:    "charactercards/nibs.png",
        pebbles: "charactercards/pebbles.png"
    };

    document.getElementById("phone-screen").style.display = "none";
    document.getElementById("result-page").style.display = "flex";

    const resultImage = document.getElementById("result-image");
    const modelContainer = document.getElementById("model-container");
    const toggleButton = document.getElementById("toggle-3d-button");

    resultImage.src = imageMap[chosenKey] || "";
    resultImage.alt = chosenKey;
    resultImage.style.display = "block";
    modelContainer.style.display = "none";
    toggleButton.textContent = "See character in 3D";
    threeJSInitialized = false;
}

// ========== HANDLE CHOICE ==========
function handleChoice(type, type2, type3, weight, id, nextIndex) {
    const dingSound = document.getElementById('dingSound');
    if (dingSound) dingSound.play();

    const currentDialogue = dialogue[currentMessageIndex];
    const chosenOption = currentDialogue.choices.find(choice => choice.id === id);

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

            if (currentMessageIndex == 0 || currentMessageIndex == 2 || currentMessageIndex >= 3) {
                const header = document.getElementById("header");
                if (header) {
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
                    header.textContent = getFormattedDate('MM/DD');
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
            } else {
                triggerIconShower();
                showBlindBoxPage();
            }

        }, 1500);
    }, (chosenOption.followUpText.length * 1000) + 500);
}

// ========== RESTART ==========
function restartQuiz() {
    threeJSInitialized = false;
    currentCharacterKey = null;

    if (renderer) {
        const container = document.getElementById('model-container');
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        renderer = null;
    }
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }
    if (controls) {
        controls.dispose();
        controls = null;
    }

    document.getElementById("blindbox-page").style.display = "none";
    document.getElementById("result-page").style.display = "none";
    document.getElementById("start-page").style.display = "flex";
    currentMessageIndex = 0;
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

// ========== START / UTILS ==========
function startConversation() {
    const first = dialogue[0];
    first.text.forEach((t, i) => setTimeout(() => addMessage(first.speaker, t), i * 400));
    setTimeout(() => showChoices(first.choices), first.text.length * 400);
}

function updateDebugScores() {
    const debugScoresElement = document.getElementById('debug-scores');
    const formattedScores = `
    ${currentMessageIndex + 1}
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
        } else {
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

// ========== EXPOSE FUNCTIONS TO GLOBAL SCOPE FOR HTML ONCLICK ==========
window.toggle3DView = toggle3DView;
window.tapBlindBox = tapBlindBox;
window.revealResult = revealResult;
window.restartQuiz = restartQuiz;
window.save = save;
window.triggerIconShower = triggerIconShower;
