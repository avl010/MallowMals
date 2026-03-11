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

    // ===== background music =====
    const bgMusic = document.getElementById("bgMusic");
    if (bgMusic) {
        bgMusic.volume = 0.25; // tweak 0.1–0.4

        const tryPlay = () => bgMusic.play().catch(() => {});

        // will usually be blocked until user interacts
        tryPlay();

        const startOnFirstInteraction = () => {
            tryPlay();
            window.removeEventListener("click", startOnFirstInteraction);
            window.removeEventListener("keydown", startOnFirstInteraction);
            window.removeEventListener("touchstart", startOnFirstInteraction);
        };

        window.addEventListener("click", startOnFirstInteraction, { once: true });
        window.addEventListener("keydown", startOnFirstInteraction, { once: true });
        window.addEventListener("touchstart", startOnFirstInteraction, { once: true });
    }

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

// Stores the user's picked answers so we can explain the final result
const answerLog = [];

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
        crumbs: "3dmodels/crumbs.glb",
        bits: "3dmodels/bits.glb",
        puffs: "3dmodels/puffs.glb",
        flakes: "3dmodels/flakes.glb",
        nibs: "3dmodels/nibs.glb",
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
            { id: 3, text: "*don't reply, it could be a scam!*", type: null, weight: 0, next: 5, followUpText: [] }
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
            { id: 3, text: "*don't reply, you still think it's a scam*", type: null, weight: 0, next: 7, followUpText: [] }
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
    // quiz questions
    {
        speaker: "bot",
        text: [
            "alrighty! lets get started",
            "no wrong answers, i’m just trying to understand your vibe.",
            "Q1) it’s a weekday. you wake up and realize you have like… 10 mins before you need to leave."
        ],
        choices: [
            { id: 1, text: "i speedrun. brush my teeth, change, grab my stuff, boom. done.", type: "flakes", weight: 2, next: 9, followUpText: [] },
            { id: 2, text: "do a quick checklist so i don’t forget anything.", type: "crumbs", weight: 2, next: 9, followUpText: [] },
            { id: 3, text: "i accept my fate and take my time lol", type: "pebbles", weight: 2, next: 9, followUpText: [] },
            { id: 4, text: "i do the bare minimum and hope for the best", type: "bits", weight: 2, next: 9, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q2) you’re trying to leave for school and you can’t seem to find ONE important thing (keys/wallet/id)."
        ],
        choices: [
            { id: 1, text: "i stop and do a thorough search. it has to be somewhere.", type: "crumbs", weight: 2, next: 10, followUpText: [] },
            { id: 2, text: "i start panic-checking everywhere 😭 pockets, bags, counters.", type: "bits", weight: 2, next: 10, followUpText: [] },
            { id: 3, text: "i do one quick check, then i leave and figure it out later.", type: "pebbles", weight: 2, next: 10, followUpText: [] },
            { id: 4, text: "i retrace my steps. \"when did i last use it?\" then i check that exact spot first.", type: "nibs", weight: 2, next: 10, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q3) you’re hungry, but not THAT hungry. what do you do?"
        ],
        choices: [
            { id: 1, text: "make something simple (toast, cereal, whatever).", type: "crumbs", weight: 2, next: 11, followUpText: [] },
            { id: 2, text: "ask someone if they wanna grab a quick snack together.", type: "puffs", weight: 2, next: 11, followUpText: [] },
            { id: 3, text: "honestly i just skip breakfast. i’ll get something later.", type: "pebbles", weight: 2, next: 11, followUpText: [] },
            { id: 4, text: "snack now, real food later.", type: "bits", weight: 2, next: 11, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q4) small disaster: you spill your drink / drop your breakfast while you’re doing something."
        ],
        choices: [
            { id: 1, text: "pause everything and clean it up the right way.", type: "crumbs", type2: "nibs", weight: 1, next: 13, followUpText: [] },
            { id: 2, text: "clean up the main mess and keep doing what i was doing.", type: "flakes", type2: "puffs", weight: 1, next: 13, followUpText: [] },
            { id: 3, text: "i wipe it once and hope that’s enough.", type: "pebbles", weight: 2, next: 13, followUpText: [] },
            { id: 4, text: "rush to clean it and accidently knock something else over too.", type: "bits", weight: 2, next: 13, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q5) you’re on your way to campus and a friend texts:",
            "\"can you help me with something?\""
        ],
        choices: [
            { id: 1, text: "yeah ofc! what’s up? i got you.", type: "puffs", weight: 2, next: 12, followUpText: [] },
            { id: 2, text: "sure, what do you need from me? details pls", type: "crumbs", weight: 2, next: 12, followUpText: [] },
            { id: 3, text: "i can, but i’m busy rn. can i get back to you later?", type: "pebbles", weight: 2, next: 12, followUpText: [] },
            { id: 4, text: "depends. what’s going on? i wanna understand first.", type: "nibs", weight: 2, next: 12, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q6) you open your laptop and realize you don’t have access to the software you need for your project anymore. what now?"
        ],
        choices: [
            { id: 1, text: "take it as a sign and deal with it later.", type: "bits", weight: 2, next: 14, followUpText: [] },
            { id: 2, text: "ask a classmate/ta if they know how to get access again.", type: "puffs", weight: 2, next: 14, followUpText: [] },
            { id: 3, text: "pivot to a different tool and continue.", type: "flakes", weight: 2, next: 14, followUpText: [] },
            { id: 4, text: "google the issue and troubleshoot until it makes sense.", type: "nibs", weight: 2, next: 14, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q7) you’re in studio/lab with a group and the vibe gets awkward."
        ],
        choices: [
            { id: 1, text: "ask a gentle question to reset the vibe (like “so how’s everyone doing?”).", type: "puffs", weight: 2, next: 15, followUpText: [] },
            { id: 2, text: "go quiet and just kinda go onto my phone. i don't like the awkwardness.", type: "pebbles", weight: 2, next: 15, followUpText: [] },
            { id: 3, text: "switch to something practical like “ok wait what’s the plan / what are we doing?”", type: "crumbs", weight: 2, next: 15, followUpText: [] },
            { id: 4, text: "jump in with a new topic or a joke so we’re not sitting in silence.", type: "flakes", weight: 2, next: 15, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q8) it's critique day. someone else is presenting. what role do u naturally take in the room?"
        ],
        choices: [
            { id: 1, text: "say one positive thing and ask simple questions.", type: "puffs", weight: 2, next: 16, followUpText: [] },
            { id: 2, text: "ask concept questions like “what’s the intent / system here?” and try to connect it to bigger ideas.", type: "nibs", weight: 2, next: 16, followUpText: [] },
            { id: 3, text: "give practical feedback like “try X / change Y” so they have next steps.", type: "flakes", weight: 2, next: 16, followUpText: [] },
            { id: 4, text: "mostly listen and take it in. i don’t talk much during crit.", type: "pebbles", weight: 2, next: 16, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q9) u have a project u’ve been avoiding. now what?"
        ],
        choices: [
            { id: 1, text: "make a quick plan, then sit down and actually get it done.", type: "crumbs", weight: 2, next: 17, followUpText: [] },
            { id: 2, text: "crank it out as fast as possible so it’s off my plate.", type: "flakes", weight: 2, next: 17, followUpText: [] },
            { id: 3, text: "continue to avoid it all day, then pull something together last minute.", type: "bits", weight: 2, next: 17, followUpText: [] },
            { id: 4, text: "spend forever figuring out the “right” way to do it and stall.", type: "nibs", weight: 2, next: 17, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q10) group project at school: u usually end up being the one who…"
        ],
        choices: [
            { id: 1, text: "keeps track of the details + deadlines so we actually finish.", type: "crumbs", weight: 2, next: 18, followUpText: [] },
            { id: 2, text: "supports everyone + keeps the vibes up.", type: "puffs", weight: 2, next: 18, followUpText: [] },
            { id: 3, text: "pushes decisions + momentum (we’re not stalling).", type: "flakes", weight: 2, next: 18, followUpText: [] },
            { id: 4, text: "throws out the big ideas / game plans, then lets other ppl handle the details.", type: "nibs", weight: 2, next: 18, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q11) when school stress hits, u tend to…"
        ],
        choices: [
            { id: 1, text: "tighten up ur schedule and micromanage the details.", type: "crumbs", type2: "flakes", weight: 1, next: 19, followUpText: [] },
            { id: 2, text: "feel overwhelmed and have to step away.", type: "pebbles", weight: 2, next: 19, followUpText: [] },
            { id: 3, text: "procrastinate anyway and figure it out as i go.", type: "bits", weight: 2, next: 19, followUpText: [] },
            { id: 4, text: "overanalyze everything and vent to someone.", type: "nibs", type2: "puffs", weight: 1, next: 19, followUpText: [] },
        ]
    },
    {
        speaker: "bot",
        text: [
            "Q12) last one i promise:",
            "it’s the day of ur final presentation and your project suddenly isn’t working the way it did last night. what do u do?"
        ],
        choices: [
            { id: 1, text: "ask a classmate or the prof for help.", type: "puffs", weight: 2, next: 20, followUpText: [] },
            { id: 2, text: "do a quick fix so it runs *enough* to present.", type: "flakes", weight: 2, next: 20, followUpText: [] },
            { id: 3, text: "i restart everything (laptop, apps) and hope that solves it.", type: "bits", weight: 2, next: 20, followUpText: [] },
            { id: 4, text: "present what i have and explain what broke.(and what i think caused it)", type: "nibs", weight: 2, next: 20, followUpText: [] }
        ]
    },
    {
        speaker: "bot",
        text: ["ok… i think i got you.", "ready to open your blind box?"],
        choices: [{ id: 1, text: "YES!!", type: "O", weight: 0, next: 100, followUpText: [] }]
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

// ========== WHY BREAKDOWN ==========
function renderWhyBreakdown(resultKey) {
    const el = document.getElementById("result-breakdown");
    if (!el) return;

    const supporting = answerLog
        .filter(a => a.type === resultKey || a.type2 === resultKey || a.type3 === resultKey)
        .sort((a, b) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 4);

    const bulletsHtml = supporting.length
        ? `<ul style="text-align:left; margin: 10px auto 0; padding-left: 18px; max-width: 320px;">
             ${supporting.map(a => `<li>${a.answerText}</li>`).join("")}
           </ul>`
        : `<div style="font-size: 12px; color: #777; margin-top: 8px;">
             I couldn’t read your choices clearly—try restarting and answering again.
           </div>`;

    el.innerHTML = `
        <div style="margin-top: 8px;">
            <div style="font-weight: bold; margin-bottom: 6px;">Why you got this:</div>
            <div style="font-size: 12px; color: #777; margin-bottom: 8px;">
                Based on the choices you made most consistently:
            </div>
            ${bulletsHtml}
        </div>
    `;
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
        crumbs: "charactercards/crumbs.png",
        bits: "charactercards/bits.png",
        puffs: "charactercards/puffs.png",
        flakes: "charactercards/flakes.png",
        nibs: "charactercards/nibs.png",
        pebbles: "charactercards/pebbles.png"
    };

    document.getElementById("phone-screen").style.display = "none";
    document.getElementById("result-page").style.display = "flex";

    // NEW: add a disclaimer above the character card (only once)
    const resultPage = document.getElementById("result-page");
    if (resultPage && !document.getElementById("result-disclaimer")) {
        const disclaimer = document.createElement("div");
        disclaimer.id = "result-disclaimer";
        disclaimer.textContent = "Disclaimer: this result might not be 100% accurate—it's just for fun.";
        disclaimer.style.fontSize = "12px";
        disclaimer.style.color = "#777";
        disclaimer.style.margin = "0 0 10px 0";
        disclaimer.style.textAlign = "center";
        disclaimer.style.maxWidth = "320px";

        resultPage.insertBefore(disclaimer, resultPage.firstChild);
    }

    const resultImage = document.getElementById("result-image");
    const modelContainer = document.getElementById("model-container");
    const toggleButton = document.getElementById("toggle-3d-button");

    resultImage.src = imageMap[chosenKey] || "";
    resultImage.alt = chosenKey;
    resultImage.style.display = "block";
    modelContainer.style.display = "none";
    toggleButton.textContent = "See character in 3D";
    threeJSInitialized = false;

    // Render "why you got this" breakdown
    renderWhyBreakdown(chosenKey);
}

// ========== HANDLE CHOICE ==========
function handleChoice(type, type2, type3, weight, id, nextIndex) {
    const dingSound = document.getElementById('dingSound');
    if (dingSound) dingSound.play();

    const currentDialogue = dialogue[currentMessageIndex];
    const chosenOption = currentDialogue.choices.find(choice => choice.id === id);

    // Log answer for breakdown
    answerLog.push({
        questionIndex: currentMessageIndex,
        answerId: id,
        answerText: chosenOption?.text || "",
        type,
        type2,
        type3,
        weight: weight || 0
    });

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

    // reset answer log
    answerLog.length = 0;

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

window.toggle3DView = toggle3DView;
window.tapBlindBox = tapBlindBox;
window.revealResult = revealResult;
window.restartQuiz = restartQuiz;
window.save = save;
window.triggerIconShower = triggerIconShower;
