// Set our main variables
let scene,  
    renderer,
    camera,
    model,                              // Our character
    neck,                               // Reference to the neck bone in the skeleton
    waist,                              // Reference to the waist bone in the skeleton
    possibleAnims,                      // Animations found in our file
    mixer,                              // THREE.js animations mixer
    idle,                               // Idle, the default state our character returns to
    clock = new THREE.Clock(),          // Used for anims, which run to a clock instead of frame rate 
    currentlyAnimating = false,         // Used to check whether characters neck is being used in another anim
    raycaster = new THREE.Raycaster(),  // Used to detect the click on our character
    loaderAnim = document.getElementById('js-loader');

// Initialize the scene
init();

function init() {
    
    // const MODEL_PATH = 'https://holydiver2.s3.eu-north-1.amazonaws.com/falling2.glb';
    const MODEL_PATH = 'https://fallingwithclothing.s3.eu-north-1.amazonaws.com/falling_character.glb';
    
    // Init the scene
    scene = new THREE.Scene();
    scene.background = null;

    // Init the renderer
    // renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-container').appendChild(renderer.domElement);
    
    // Add a camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = -3;
    
    const gltfLoader = new THREE.GLTFLoader();

    gltfLoader.load(
        MODEL_PATH,
        function(gltf) {
            const model = gltf.scene;
            model.position.y = -11;
            model.position.set(2, -7, 0); // Center the model at origin
            model.scale.set(5, 5, 5); // Adjust the scale as needed
            model.rotation.y = Math.PI; // Rotate the model 180 degrees around the y-axis
            model.rotation.x = THREE.Math.degToRad (50); // Tilt the model forward slightly (approximately 22.5 degrees)
            const fileAnimations = gltf.animations;

            fileAnimations.forEach((clip) => {
                console.log('Animation name:', clip.name);
            });

            model.traverse((object) => {

                if (object.isMesh) {
                    object.material.envMap = null;  // Remove any environment map
                    object.material.needsUpdate = true;
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
                // Reference the neck and waist bones
                if (object.isBone && object.name === 'mixamorigNeck') {
                    neck = object;
                  }
                  if (object.isBone && object.name === 'mixamorigSpine') {
                    waist = object;
                  }
                });
                
            scene.add(model);

            // Center the camera on the model
            camera.position.set(0, 0, 30); // Adjust camera distance as needed
            camera.lookAt(0, 0, 0); // Ensure the camera is looking at the model's position
        
            if (loaderAnim) {
                loaderAnim.remove(); // Remove the loader element safely
            }
        
            mixer = new THREE.AnimationMixer(model);

            const animationClip = THREE.AnimationClip.findByName(fileAnimations, 'Armature|mixamo.com|Layer0');
                animationClip.tracks.splice(3, 3);
                animationClip.tracks.splice(9, 3);
                
            const animationAction = mixer.clipAction(animationClip);
                animationAction.play();

            possibleAnims = gltf.animations.filter(val => val.name !== 'idle').map(val => {
                let clip = THREE.AnimationClip.findByName(gltf.animations, val.name);

                clip.tracks.splice(3, 3);
                clip.tracks.splice(9, 3);

                return mixer.clipAction(clip);
            });
        }
    );
    
    // Add lights
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    scene.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    // Add directional Light to scene
    scene.add(dirLight);
}

// Variables for zooming
let zoomStartZ = 30; // Starting camera position
let zoomEndZ = 10;  // Target camera position (final zoom level)
let zoomLerpFactor = 0.02; // Lerp factor for smooth interpolation (adjust as needed for smoother zoom)

let currentScale = 1.0; // Start with a distant background scale
let blurLevel = 20;

// New easing function for smoother transitions
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function update() {
    if (mixer) {
        mixer.update(clock.getDelta());
    }

    if (model) {
        // Use easing for smoother zoom transition
        let easedProgress = easeInOutQuad(progress / totalDuration);

        // Calculate the zoomed Z-position with easing
        const targetPositionZ = zoomEndZ + (zoomStartZ - zoomEndZ) * (1 - easedProgress);

        // Apply smooth lerp to zoom
        camera.position.z = THREE.Math.lerp(camera.position.z, targetPositionZ, zoomLerpFactor);
        camera.lookAt(model.position);
    }

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(update);
}



// Define variables for zoom effect
let zoomSpeed = 1.0;  // Faster initial zoom speed
let zoomAcceleration = 0.1;  // Higher rate of acceleration for a faster zoom
let maxZoomSpeed = 3.0; // Increased maximum zoom speed
let fadeThreshold = 15; // Threshold where zoom should start accelerating


update();

  
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

window.addEventListener('click', e => raycast(e));
window.addEventListener('touchend', e => raycast(e, true));

function raycast(e, touch = false) {
    const mouse = {};
    if (touch) {
        mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
        mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
    } else {
        mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
        mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    }
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects[0]) {
        const object = intersects[0].object;

        if (object.name === 'stacy') {
            if (!currentlyAnimating) {
                currentlyAnimating = true;
                playOnClick();
            }
        }
    }
}
  
// Get a random animation, and play it 
function playOnClick() {
    let anim = Math.floor(Math.random() * possibleAnims.length);
    playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
}

function playModifierAnimation(from, fSpeed, to, tSpeed) {
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function() {
        from.enabled = true;
        to.crossFadeTo(from, tSpeed, true);
        currentlyAnimating = false;
    }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
}
  
document.addEventListener('mousemove', function(e) {
    const mousecoords = getMousePos(e);
    if (neck && waist) {
        moveJoint(mousecoords, neck, 50);
        moveJoint(mousecoords, waist, 30);
    }
});

function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
}
  
function moveJoint(mouse, joint, degreeLimit) {
    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
    joint.rotation.y = THREE.Math.degToRad(-degrees.x);
    joint.rotation.x = THREE.Math.degToRad(degrees.y);
}
  
function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // Left (Rotates neck left between 0 and -degreeLimit)
    if (x <= w.x / 2) {
        xdiff = w.x / 2 - x; 
        xPercentage = (xdiff / (w.x / 2)) * 100; 
        dx = ((degreeLimit * xPercentage) / 100) * -1; 
    }
    
    // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
    }
    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
    }
    return { x: dx, y: dy };
}

document.addEventListener('DOMContentLoaded', function() {
    const earthImageContainer = document.getElementById('earthImageContainer');
    const needleContainer = document.getElementById('needle-container');
    const loadingText = document.getElementById('loading-text');
    const mobileLoadingPercentage = document.getElementById('loading-percentage');
    const mobileAltitude = document.getElementById('altitude');
    const fadeOverlay = document.getElementById('fade-overlay');
    const popup = document.getElementById('navigationPopup');

    const totalDuration = 20000; // 20 seconds
    const updateInterval = 100;  // Update every 100ms
    let progress = 0;

    let currentScale = 0.5; // Start with a distant background scale

    // Listen for when the fade-out animation ends
    fadeOverlay.addEventListener('animationend', function(event) {
        if (event.animationName === 'fadeToTransparent') {
            // After the fade overlay has faded out, trigger the slide-in
            popup.classList.add('open');
        }
    });

    // Optional: Close the popup when the close button is clicked
    const closeBtn = document.getElementById('closePopup');
    closeBtn.addEventListener('click', function() {
        popup.classList.remove('open');
        popup.classList.add('close-pop-up');
    });
    
    function updateEffects() {
        // Start the timer for performance monitoring
        const start = performance.now();

        progress += updateInterval;
        let progressPercentage = Math.min(progress / totalDuration, 1) * 100; // Use the same progress for both
    
        // Needle stutter effect based on progressPercentage
        let angle = -20 - (progressPercentage / 100) * 301;
        
        needleContainer.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    
        loadingText.textContent = `${Math.round(progressPercentage)}%`;
    
        // Update the mobile loading percentage
        if (mobileLoadingPercentage) {
            mobileLoadingPercentage.textContent = `${Math.round(progressPercentage)}%`;
        }
    
        // Update the altitude on the mobile display
        if (mobileAltitude) {
            let altitude = Math.floor(10000 * (1 - progressPercentage / 100)); // Adjust for altitude range
            mobileAltitude.textContent = `${altitude}m`;
        }

        // Trigger fade to white when the altimeter reaches 90%
        if (progressPercentage >= 90) {
            const whiteFadeOverlay = document.getElementById('white-fade-overlay');
            whiteFadeOverlay.style.opacity = 1; // Start fade to white

            // Apply a fade-out to the body
            document.body.classList.add('fade-out');

            // Set a flag in localStorage to signal a fade-in on the next page
            localStorage.setItem('fadeIn', 'true');

            // Redirect after the fade is complete
            setTimeout(() => {
                window.location.href = "http://vwr-web1.s3-website-us-west-1.amazonaws.com/kaltergott/Popup_Texts/";
            }, 2000); // Delay matches the fade-out animation duration (2 seconds)
        }

        // Ensure camera only updates if necessary
        if (model) {
            camera.lookAt(model.position);
        }

        // Only resize renderer if needed
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        // Check for long-running frame
        const duration = performance.now() - start;
        if (duration > 16) {
            console.warn(`[Violation] 'requestAnimationFrame' handler took ${duration}ms`);
        }
    
        // Zoom effect synchronized with progressPercentage
        const baseScale = 1.0; 
        const maxScale = 4.5; 
        const zoomSpeed = Math.pow(progressPercentage / 100, 2); // Use progressPercentage to control zoom
        currentScale = baseScale + (maxScale - baseScale) * zoomSpeed;
    
        if (progressPercentage >= 5 && progressPercentage <= 60) { // Faster blur decrease
            blurLevel = 20 * (1 - (progressPercentage - 5) / 55);
        } else if (progressPercentage > 60) {
            blurLevel = 0;
        }
        earthImageContainer.style.filter = `blur(${blurLevel}px)`;
    
        earthImageContainer.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
    
        // Trigger fade to white when the altimeter reaches 100%
        if (progressPercentage >= 100) {
            document.getElementById('white-fade-overlay').style.opacity = 1; // Start fade to white
        }
    
        if (progress < totalDuration) {
            setTimeout(updateEffects, updateInterval);
        }
    }
    

    
    

    // Set initial position of the needle
    needleContainer.style.transform = `translate(-50%, -50%) rotate(-20deg)`; 

    // Start the combined effects
    updateEffects();

    // Parallax Effect - integrated with other transforms
    document.addEventListener('mousemove', function(e) {
        const pageX = e.clientX - (window.innerWidth / 2);
        const pageY = e.clientY - (window.innerHeight / 2);

        const movementStrengthX = 300;
        const movementStrengthY = 150;

        const translateX = (movementStrengthX / window.innerWidth) * pageX * -1;
        const translateY = (movementStrengthY / window.innerHeight) * pageY * -1;

        earthImageContainer.style.transform = `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }, 100);  // Throttle to reduce the number of calls (e.g., every 100ms)
    
    document.addEventListener('DOMContentLoaded', function() {
        // Check if the fadeIn flag is set in localStorage
        if (localStorage.getItem('fadeIn') === 'true') {
            // Apply the fade-in class to the body
            document.body.classList.add('fade-in');
    
            // Remove the flag from localStorage after applying the fade-in
            localStorage.removeItem('fadeIn');
        }
    });
    
});
