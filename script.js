const flowerLayer = document.querySelector(".flower-layer");
const giftLink = document.querySelector(".gift");
const giftPage = document.querySelector(".gift-page");
const surprisePage = document.querySelector(".surprise-page");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const musicStartedKey = "romanticMusicStarted";
const musicPositionKey = "romanticMusicPosition";
const musicPlayer = new Audio("music.mp3");
musicPlayer.loop = true;
musicPlayer.preload = "auto";

const musicButton = document.createElement("button");
musicButton.type = "button";
musicButton.textContent = "Tap to play music";
musicButton.hidden = true;
musicButton.setAttribute("aria-live", "polite");
Object.assign(musicButton.style, {
  position: "fixed",
  right: "16px",
  bottom: "16px",
  zIndex: "20",
  padding: "10px 14px",
  border: "1px solid #c98e83",
  borderRadius: "999px",
  background: "#fff8f0",
  color: "#713e3b",
  font: "inherit",
  cursor: "pointer",
});
document.body.append(musicButton);

function saveMusicPosition() {
  if (!musicPlayer.paused && Number.isFinite(musicPlayer.currentTime)) {
    sessionStorage.setItem(musicPositionKey, String(musicPlayer.currentTime));
  }
}

function playMusic() {
  musicPlayer.play().then(() => {
    musicButton.hidden = true;
  }).catch((error) => {
    if (error.name === "NotAllowedError") {
      musicButton.textContent = "Tap to play music";
    } else {
      musicButton.textContent = "Retry music.mp3";
    }
    musicButton.hidden = false;
  });
}

function resumeMusic() {
  const savedPosition = Number(sessionStorage.getItem(musicPositionKey));
  function startAtSavedPosition() {
    if (Number.isFinite(savedPosition) && savedPosition > 0) {
      const duration = musicPlayer.duration;
      musicPlayer.currentTime =
        Number.isFinite(duration) && duration > 0
          ? savedPosition % duration
          : savedPosition;
    }
    playMusic();
  }

  musicPlayer.addEventListener("error", () => {
    musicButton.textContent = "Check that music.mp3 is beside the HTML files";
    musicButton.hidden = false;
  }, { once: true });

  if (musicPlayer.readyState >= HTMLMediaElement.HAVE_METADATA) {
    startAtSavedPosition();
  } else {
    musicPlayer.addEventListener("loadedmetadata", startAtSavedPosition, { once: true });
  }
}

if (sessionStorage.getItem(musicStartedKey) === "true") resumeMusic();

musicButton.addEventListener("click", playMusic);
musicPlayer.addEventListener("timeupdate", saveMusicPosition);
window.addEventListener("pagehide", saveMusicPosition);

const flowerImages = [
  "Gemini_Generated_Image_8nydz58nydz58nyd-removebg-preview.png",
  "Isolated_White_Rose_Bloom-removebg-preview.png",
];

function fillFlowerCurtain(delayOffset = 0) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const size = Math.ceil(Math.min(width, height) * 0.64);
  const step = size * 0.55;
  const start = -size * 0.28;
  const columns = Math.ceil((width - start) / step) + 1;
  const rows = Math.ceil((height - start) / step) + 1;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const flower = document.createElement("img");

      flower.className = "falling-flower";
      flower.src = flowerImages[(row + column) % flowerImages.length];
      flower.alt = "";
      flower.draggable = false;
      flower.style.setProperty("--flower-left", `${start + column * step}px`);
      flower.style.setProperty("--flower-top", `${start + row * step}px`);
      flower.style.setProperty("--flower-size", `${size}px`);
      flower.style.setProperty(
        "--flower-delay",
        `${(delayOffset + column * 0.045 + row * 0.025).toFixed(2)}s`,
      );
      flowerLayer.append(flower);
    }
  }
}

if (giftLink && giftPage) {
  giftLink.addEventListener("click", (event) => {
    if (giftLink.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      return;
    }

    sessionStorage.setItem(musicStartedKey, "true");
    sessionStorage.removeItem(musicPositionKey);
    musicPlayer.currentTime = 0;
    playMusic();

    if (prefersReducedMotion) return;

    event.preventDefault();
    giftLink.setAttribute("aria-disabled", "true");
    giftPage.classList.add("is-leaving");
    flowerLayer.classList.add("flower-curtain", "flower-curtain--entering");
    fillFlowerCurtain();

    window.setTimeout(() => {
      window.location.assign(giftLink.href);
    }, 1550);
  });
}

if (surprisePage && !prefersReducedMotion) {
  flowerLayer.classList.add("flower-curtain", "flower-curtain--revealing");
  fillFlowerCurtain(0.85);
}

const passcodePage = document.querySelector(".passcode-page");

if (passcodePage) {
  const dots = [...passcodePage.querySelectorAll(".passcode-dot")];
  const feedback = passcodePage.querySelector(".passcode-feedback");
  const keypad = passcodePage.querySelector(".keypad");
  let enteredCode = "";
  let isRedirecting = false;
  let resetTimeout;

  function renderPasscode() {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-filled", index < enteredCode.length);
    });
  }

  function clearPasscode(message = "") {
    enteredCode = "";
    feedback.textContent = message;
    passcodePage.classList.toggle("has-error", Boolean(message));
    renderPasscode();
  }

  function submitPasscode() {
    if (enteredCode === "1809") {
      isRedirecting = true;
      feedback.textContent = "Unlocked!";
      window.location.assign("4.html");
      return;
    }

    clearPasscode("That passkey wasn't right. Try again.");
    window.clearTimeout(resetTimeout);
    resetTimeout = window.setTimeout(() => clearPasscode(), 1200);
  }

  function addDigit(digit) {
    if (isRedirecting || enteredCode.length >= dots.length) return;

    window.clearTimeout(resetTimeout);
    enteredCode += digit;
    feedback.textContent = "";
    passcodePage.classList.remove("has-error");
    renderPasscode();

    if (enteredCode.length === dots.length) submitPasscode();
  }

  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.hasAttribute("data-clear")) {
      window.clearTimeout(resetTimeout);
      clearPasscode();
    } else {
      addDigit(button.dataset.digit);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (/^\d$/.test(event.key)) {
      addDigit(event.key);
    } else if (event.key === "Backspace") {
      window.clearTimeout(resetTimeout);
      clearPasscode();
    } else if (event.key === "Escape") {
      window.clearTimeout(resetTimeout);
      clearPasscode();
    }
  });
}

const pageLoader = document.querySelector(".page-loader");
const loadedPage = document.querySelector(".photo-page.is-loading");

document.querySelectorAll(".photo-frame__well img").forEach((image) => {
  const markMissingImage = () => {
    image.parentElement.classList.add("is-missing");
  };

  image.addEventListener("error", markMissingImage, { once: true });

  if (image.complete && image.naturalWidth === 0) markMissingImage();
});

if (pageLoader && loadedPage) {
  window.setTimeout(() => {
    pageLoader.classList.add("is-hidden");
    loadedPage.classList.remove("is-loading");
    loadedPage.setAttribute("aria-hidden", "false");

    pageLoader.addEventListener("transitionend", (event) => {
      if (event.propertyName === "opacity") pageLoader.remove();
    }, { once: true });

    window.setTimeout(() => pageLoader.remove(), 700);
  }, 4000);
}

const letter = document.querySelector(".letter-copy__typed");

if (letter) {
  const letterText =
    "Nimo meri jaan, tum duniya ki sabse pyari aur khubsurat larki ho. Tumhari ankhon ki chamak aur tumhari muskurahat mere pooray din ki thakan mita deti hai. Tumhare jaisa pyara insan main ne aj tak nahi dekha, aur tumhari sharafat, tumhari masoomiyat hi tumhein sabse alag banati hai. Main bas chahta hoon ke tum ek lamhe ke liye ruko aur yeh mehsous karo ke tum mere liye kitni gehri aur poori tarah ahmiyat rakhti ho. Jab bhi main tumse baat karta hoon to bhaari se bhaari din bhi achanak halke lagne lagte hain, aur mera dil ek aisi pak khushi se bhar jata hai jise main bayan bhi nahi kar sakta. Tum be-inteha khubsurat ho, sirf apne dikhne mein nahi balkay us narm aur parwah karne wali rooh mein bhi jo tum apne andar rakhti ho. Tumhari awaz, tumhari hansi aur jis tarah tum khayal rakhti ho, yeh mere har din ka sabse pasandida hissa ban chuki hain.\n\nMain chahta hoon ke tum yeh jano ke har ache buray waqt mein aur zindagi ke har mor par meri pasand hamesha tum hi raho gi. Main woh banna chahta hoon jo har cheez mein tumhare sath khara rahe, tumhari muskurahat ki hifazat kare, jab haalat mushkil hon to tumhara hath thame aur tumhare sath har choti khushi ka jashan manaye. Tum ab sirf meri zindagi ka ek hissa nahi rahi. Meri Nimo, mujhe kabhi chor ke nahi jana. Main bohot zyada attach ho gaya hoon aap ke sath. Meri Nimo, meri jaan, meri duniya, sab kuch tum hi ho.";

  function typeLetter() {
    let characterIndex = 0;
    const typingTimer = window.setInterval(() => {
      letter.textContent = letterText.slice(0, characterIndex + 1);
      characterIndex += 1;

      if (characterIndex >= letterText.length) {
        window.clearInterval(typingTimer);
        letter.parentElement.classList.add("is-complete");
      }
    }, 24);
  }

  if (prefersReducedMotion) {
    letter.textContent = letterText;
    letter.parentElement.classList.add("is-complete");
  } else {
    const letterSection = document.querySelector(".letter-section");
    const letterObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          letterObserver.disconnect();
          typeLetter();
        }
      },
      { threshold: 0.18 },
    );

    letterObserver.observe(letterSection);
  }
}
