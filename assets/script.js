const resizeDebounced = {
    listeners: [],
    lastTimeoout: 0,
    addListener(listener) {
        this.listeners.push(listener);
    },
    internalListener(ev) {
        for (const listener of this.listeners) {
            listener(ev);
        }
    },
};

window.addEventListener("resize", () => {
    clearTimeout(resizeDebounced.lastTimeoout);
    resizeDebounced.lastTimeoout = setTimeout(resizeDebounced.internalListener.bind(resizeDebounced), 500);
});

document.addEventListener("DOMContentLoaded", () => {
    setupHeroAnimation();
    setupMainNav();
    setupProjectAnimation();
    setupProjectNav();
});

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

const meteorAnimator = {
    states: [],
    animationCallback: undefined,
    animationId: 0,
    setup() {
        this.states = [
            [document.getElementsByClassName("meteor-1")[0], 1],
            [document.getElementsByClassName("meteor-2")[0], 0.9],
            [document.getElementsByClassName("meteor-3")[0], 1.1],
            [document.getElementsByClassName("meteor-4")[0], 0.8],
            [document.getElementsByClassName("meteor-5")[0], 1.2],
        ].map(([el, velocity]) => ({
            translateCount: 0,
            translateX: 0,
            translateY: 0,
            el,
            velocity
        }));
        this.animationCallback = this.animate.bind(this);
    },
    animate() {
        const meteorAlphaDuration = 32;
        const meteorAlphaFactor = 1 / meteorAlphaDuration;
        for (const meteor of this.states) {
            let nextTranslateX = meteor.translateX + meteor.velocity;
            let nextTranslateY = meteor.translateY + meteor.velocity;
            if (nextTranslateY >= window.innerHeight + 200 ||
                nextTranslateX >= window.innerWidth + 200 ||
                meteor.translateX == 0) {
                nextTranslateX = Math.random() * 0.5 * window.innerWidth;;
                nextTranslateY = Math.random() * 0.5 * window.innerHeight;
                meteor.translateCount = -1;
            }
            meteor.translateX = nextTranslateX;
            meteor.translateY = nextTranslateY;
            meteor.translateCount++;
            meteor.el.style.transform = `translate(${nextTranslateX}px, ${nextTranslateY}px) rotate(45deg)`;
            meteor.el.style.opacity = clamp(meteor.translateCount * meteorAlphaFactor, 0, 1);
        }
        this.requestAnimation();
    },
    requestAnimation() {
        this.animationId = window.requestAnimationFrame(this.animationCallback);
    },
    cancelAnimation() {
        window.cancelAnimationFrame(this.animationId);
    }
};

const starAnimator = {
    elements: [],
    setup() {
        this.elements = [document.getElementsByClassName("star-1")[0], document.getElementsByClassName("star-2")[0]];

        for (const el of this.elements) {
            el.addEventListener("animationiteration", (ev) => {
                this.animate(el);
            });
            this.animate(el);
        }
    },
    animate(el) {
        const leftVw = Math.floor(Math.random() * 90) + 5;
        const topVh = Math.floor(Math.random() * 90) + 5;

        el.style.transform = `translate(${leftVw}vw, ${topVh}vh)`;
        el.style.animationPlayState = "running";
    },
    enable(enabled) {
        for (const el of this.elements) {
            el.classList.toggle("star--animated", enabled);
        }
    }
};

function setupHeroAnimation() {
    const headerBar = document.getElementsByClassName("header-bar")[0];
    const title = document.getElementsByClassName("main-hero--title")[0];
    const subtitle = document.getElementsByClassName("main-hero--subtitle")[0];
    const alternateTitle = document.getElementsByClassName("main-hero--alternate-title")[0];
    const alternateTitleBar = document.getElementsByClassName("main-hero--alternate-title-bar")[0];
    const headerTitle = document.getElementsByClassName("header-bar--title")[0];

    const position = {
        hero: {
            x: 0,
            y: 0
        },
        header: {
            x: 0,
            y: 0
        }
    };
    let morphTitleScaleFactor = 1;

    function updateParameters() {
        title.style.transform = "";
        const heroRect = title.getBoundingClientRect();
        position.hero = {
            x: heroRect.x,
            y: heroRect.y
        };
        const headerRect = headerTitle.getBoundingClientRect();
        position.header = {
            x: headerRect.x,
            y: headerRect.y
        };
        morphTitleScaleFactor = headerRect.height / heroRect.height;
    }

    let headerBarIsScrolled = false;
    function updateAnimation() {
        const scrollProgress = window.scrollY / window.innerHeight;

        let delta = 0;
        const alphaDuration = 0.5;
        const alphaFactor = 1.0 / alphaDuration;
        for (const spanElement of subtitle.children) {
            const currentAlpha = clamp((scrollProgress - delta) * alphaFactor, 0, 1);
            spanElement.style.opacity = currentAlpha;
            delta += 0.75;
        }

        const scaleDuration = 2.0;
        const scaleFactor = 1.0 / scaleDuration;
        const currentScale = clamp(1 + (scrollProgress - delta) * scaleFactor, 1, 2);
        const currentAlpha = clamp(1 - (scrollProgress - delta) * scaleFactor, 0, 1);
        subtitle.style.transform = `scale(${currentScale})`;
        subtitle.style.opacity = currentAlpha;
        delta += 1.25;

        const morphProgress = 1 - currentAlpha;
        const morphTranslateY = (position.header.y - position.hero.y) * morphProgress;
        const morphTranslateX = (position.header.x - position.hero.x) * morphProgress;
        const morphScale = lerp(1, morphTitleScaleFactor, morphProgress);
        // console.log(morphScale)
        title.style.transform = `translate(${morphTranslateX}px, ${morphTranslateY}px) scale(${morphScale})`;
        // console.log(morphTranslateY);

        const morphAlphaDuration = 0.5;
        const morphAlphaFactor = 1.0 / morphAlphaDuration;
        const morphAlphaProgress = clamp((scrollProgress - delta - 0.75) * morphAlphaFactor, 0, 1);
        // console.log(((scrollProgress - delta - 2.0) * morphAlphaFactor), morphAlphaProgress);
        title.style.opacity = 1 - morphAlphaProgress;
        headerTitle.style.opacity = morphAlphaProgress;

        delta -= 0.5;

        const alternateTitleDuration = 1.0;
        const alternateTitleFactor = 1.0 / alternateTitleDuration;
        const alternateTitleProgress = clamp((scrollProgress - delta) * alternateTitleFactor, 0, 1);
        const alternateTitleTranslateY = lerp(-64, 0, alternateTitleProgress);
        alternateTitle.style.opacity = alternateTitleProgress;
        alternateTitle.style.transform = `translateY(${alternateTitleTranslateY}px)`;
        delta += 0.75;

        const alternateTitleBarDuration = 1.0;
        const alternateTitleBarFactor = 1.0 / alternateTitleBarDuration;
        const alternateTitleBarScale = clamp((scrollProgress - delta) * alternateTitleBarFactor, 0, 1);
        alternateTitleBar.style.transform = `scaleX(${alternateTitleBarScale})`;

        const headerBarMustScrolled = window.scrollY >= (7 * window.innerHeight - 64);
        if (headerBarMustScrolled && !headerBarIsScrolled) {
            headerBar.classList.add("header-bar--scrolled");
            headerBarIsScrolled = true;
        } else if (!headerBarMustScrolled && headerBarIsScrolled) {
            headerBar.classList.remove("header-bar--scrolled");
            headerBarIsScrolled = false;
        }
    }

    if (document && document.fonts) {
        document.fonts.ready.then(() => {
            updateParameters();
            updateAnimation();
        });
    }

    meteorAnimator.setup();
    meteorAnimator.requestAnimation();

    starAnimator.setup();
    starAnimator.enable(true);

    updateParameters();
    updateAnimation();

    document.addEventListener("scroll", updateAnimation);
    resizeDebounced.addListener(() => {
        updateParameters();
        updateAnimation();
    });
}

function setupMainNav() {
    const headerBarBurger = document.getElementsByClassName("header-bar--burger")[0];
    const navBarClose = document.getElementsByClassName("nav-bar--close")[0];
    const navBar = document.getElementsByClassName("nav-bar")[0];

    headerBarBurger.addEventListener("click", () => {
        navBar.classList.toggle("nav-bar--show");
    });

    function closeNavBar() {
        navBar.classList.remove("nav-bar--show");
    }
    navBarClose.addEventListener("click", closeNavBar);
    for (const el of navBar.getElementsByClassName("nav-bar--link"))
        el.addEventListener("click", closeNavBar);
}

function setupProjectAnimation() {
    const projectEls = document.getElementsByClassName("project");
    const intersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            const innerElement = entry.target.getElementsByClassName("project--inner")[0];
            if (entry.isIntersecting)
                innerElement.classList.add("project--in-view");
            else innerElement.classList.remove("project--in-view");
        }
    }, {
        threshold: 0.1
    });
    for (const el of projectEls)
        intersectionObserver.observe(el);
}

function setupProjectNav() {
    const itemTemplate = document.getElementById("project-nav-item-template");
    const bigNav = document.getElementsByClassName("project-nav--big")[0];
    const nav = document.getElementsByClassName("project-nav--stickied")[0];


    function createProjectNavNode(project) {
        const projectEl = itemTemplate.content.cloneNode(true);
        const linkEl = projectEl.querySelector("a");
        linkEl.innerText = project.name;
        linkEl.href = `#${project.id}`
        return projectEl;
    }

    const projects = Array.from(document.getElementsByClassName("project")).map((el) => ({
        name: el.getElementsByClassName("project--title")[0].innerText,
        id: el.id,
        isVisible: false,
        el
    })).map(project => {
        const navNode = createProjectNavNode(project);
        const bigNavNode = createProjectNavNode(project);
        const result = {
            ...project,
            navEl: navNode.children[0],
            bigNavEl: bigNavNode.children[0]
        };

        bigNav.appendChild(bigNavNode);
        nav.appendChild(navNode);

        return result;
    });

    let lastActive = null;

    function setActiveNav(el, active) {
        el.classList.toggle("project-nav--item--active", active);
    }

    function setActiveProject(targetProject, force) {
        if (lastActive == targetProject && !force) return;

        for (const project of projects) {
            const active = project == targetProject;
            setActiveNav(project.navEl, active)
        }

        if (targetProject) {
            nav.scrollTo({
                left: targetProject.navEl.offsetLeft - (window.innerWidth / 2 - targetProject.navEl.offsetWidth / 2),
                behavior: "smooth"
            })
            nav.style.setProperty("--indicator-width", `${targetProject.navEl.offsetWidth + 16}px`);
            nav.style.setProperty("--indicator-left", `${targetProject.navEl.offsetLeft - 8}px`);
        } else {
            nav.style.setProperty("--indicator-width", "0");
        }

        lastActive = targetProject;
    }

    const projectObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            const project = projects.find((project) => project.el == entry.target);
            project.isVisible = entry.isIntersecting;
        }

        setActiveProject(projects.find((project) => project.isVisible), false);
    }, {
        threshold: [0.0, 1.0],
        rootMargin: "-45% 0px 0px 0px"
    });

    for (const project of projects) {
        projectObserver.observe(project.el);
    }

    resizeDebounced.addListener(() => {
        setActiveProject(lastActive, true);
    });

    const navObserver = new IntersectionObserver((entries) => {
        const top = entries[0].boundingClientRect.top
        const isSticky = !entries[0].isIntersecting && Math.abs(top - 64) <= 1;
        nav.style.visibility = isSticky ? "visible" : "hidden";
    }, {
        threshold: [0.0, 1.0],
        rootMargin: "-113px 0px 0px 0px" // mustmatch with header height + nav height + 1
    });


    navObserver.observe(nav);
}
