document.addEventListener("DOMContentLoaded", () => {
    const headerBar = document.getElementsByClassName("header-bar")[0];
    const mainHeroTitle = document.getElementsByClassName("main-hero--title")[0];
    const mainHeroSubtitle = document.getElementsByClassName("main-hero--subtitle")[0];
    const mainHeroAlternateTitle = document.getElementsByClassName("main-hero--alternate-title")[0];
    const mainHeroAlternateTitleBar = document.getElementsByClassName("main-hero--alternate-title-bar")[0];
    const headerTitle = document.getElementsByClassName("header-bar--title")[0];

    function clamp(val, min, max) {
        return Math.min(max, Math.max(min, val));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    const mainTitlePosition = {
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

    function updateMainHeroAnimationParameters() {
        mainHeroTitle.style.transform = "";
        const heroRect = mainHeroTitle.getBoundingClientRect();
        mainTitlePosition.hero = {
            x: heroRect.x,
            y: heroRect.y
        };
        const headerRect = headerTitle.getBoundingClientRect();
        mainTitlePosition.header = {
            x: headerRect.x,
            y: headerRect.y
        };
        console.log(mainTitlePosition)
        morphTitleScaleFactor = headerRect.height / heroRect.height;
    }

    let headerBarIsScrolled = false;
    function updateMainHeroAnimation() {
        const scrollProgress = window.scrollY / window.innerHeight;
        // console.log(scrollProgress)

        let delta = 0;
        const alphaDuration = 0.5;
        const alphaFactor = 1.0 / alphaDuration;
        for (const spanElement of mainHeroSubtitle.children) {
            const currentAlpha = clamp((scrollProgress - delta) * alphaFactor, 0, 1);
            spanElement.style.opacity = currentAlpha;
            delta += 0.75;
        }

        const scaleDuration = 2.0;
        const scaleFactor = 1.0 / scaleDuration;
        const currentScale = clamp(1 + (scrollProgress - delta) * scaleFactor, 1, 2);
        const currentAlpha = clamp(1 - (scrollProgress - delta) * scaleFactor, 0, 1);
        mainHeroSubtitle.style.transform = `scale(${currentScale})`;
        mainHeroSubtitle.style.opacity = currentAlpha;
        delta += 1.25;

        const morphProgress = 1 - currentAlpha;
        const morphTranslateY = (mainTitlePosition.header.y - mainTitlePosition.hero.y) * morphProgress;
        const morphTranslateX = (mainTitlePosition.header.x - mainTitlePosition.hero.x) * morphProgress;
        const morphScale = lerp(1, morphTitleScaleFactor, morphProgress);
        // console.log(morphScale)
        mainHeroTitle.style.transform = `translate(${morphTranslateX}px, ${morphTranslateY}px) scale(${morphScale})`;
        // console.log(morphTranslateY);

        const morphAlphaDuration = 0.5;
        const morphAlphaFactor = 1.0 / morphAlphaDuration;
        const morphAlphaProgress = clamp((scrollProgress - delta - 0.75) * morphAlphaFactor, 0, 1);
        // console.log(((scrollProgress - delta - 2.0) * morphAlphaFactor), morphAlphaProgress);
        mainHeroTitle.style.opacity = 1 - morphAlphaProgress;
        headerTitle.style.opacity = morphAlphaProgress;

        delta -= 0.5;

        const alternateTitleDuration = 1.0;
        const alternateTitleFactor = 1.0 / alternateTitleDuration;
        const alternateTitleProgress = clamp((scrollProgress - delta) * alternateTitleFactor, 0, 1);
        const alternateTitleTranslateY = lerp(-64, 0, alternateTitleProgress);
        mainHeroAlternateTitle.style.opacity = alternateTitleProgress;
        mainHeroAlternateTitle.style.transform = `translateY(${alternateTitleTranslateY}px)`;
        delta += 0.75;

        const alternateTitleBarDuration = 1.0;
        const alternateTitleBarFactor = 1.0 / alternateTitleBarDuration;
        const alternateTitleBarScale = clamp((scrollProgress - delta) * alternateTitleBarFactor, 0, 1);
        mainHeroAlternateTitleBar.style.transform = `scaleX(${alternateTitleBarScale})`;

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
            updateMainHeroAnimationParameters();
            updateMainHeroAnimation();
        });
    }

    updateMainHeroAnimationParameters();
    updateMainHeroAnimation();

    const meteorsAnimation = [
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

    function nextMeteorTrnanslate(pos, velocity) {
        let nextPos = pos + velocity;
        if (nextPos >= window.innerHeight + 200 || pos == 0) {
            nextPos = Math.random() * 0.25 * window.innerHeight;
        }
        return nextPos;
    }

    function meteorAnimation() {
        const meteorAlphaDuration = 32;
        const meteorAlphaFactor = 1 / meteorAlphaDuration;
        for (const meteor of meteorsAnimation) {
            let nextTranslateX = meteor.translateX + meteor.velocity;
            let nextTranslateY = meteor.translateY + meteor.velocity;
            if (nextTranslateY >= window.innerHeight + 200 || meteor.translateX == 0) {
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
        window.requestAnimationFrame(meteorAnimation);
    }
    window.requestAnimationFrame(meteorAnimation);

    function updateStarAnimation(el) {
        const leftVw = Math.floor(Math.random() * 90) + 5;
        const topVh = Math.floor(Math.random() * 90) + 5;

        el.style.transform = `translate(${leftVw}vw, ${topVh}vh)`;
        el.style.animationPlayState = "running";
    }

    function initStarAnimation(el) {
        el.addEventListener("animationiteration", () => {
            updateStarAnimation(el);
        });
        updateStarAnimation(el);
    }

    initStarAnimation(document.getElementsByClassName("star-1")[0]);
    initStarAnimation(document.getElementsByClassName("star-2")[0]);

    let windowResizeTimeout = 0;
    function windowResizeListener() {
        updateMainHeroAnimationParameters();
        updateMainHeroAnimation();
    }

    document.addEventListener("scroll", updateMainHeroAnimation);
    window.addEventListener("resize", () => {
        clearTimeout(windowResizeTimeout);
        windowResizeTimeout = setTimeout(windowResizeListener, 500);
    });

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

    setupProjectNav();
})

function setupProjectNav() {
    const itemTemplate = document.getElementById("project-nav-item-template");
    const bigNav = document.getElementById("project-nav");
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

    function setActiveProject(targetProject) {
        if (lastActive == targetProject) return;

        for (const project of projects) {
            const active = project == targetProject;
            setActiveNav(project.navEl, active)
            setActiveNav(project.bigNavEl, active)
        }

        if (targetProject)
            targetProject.navEl.scrollIntoView({
                behavior: "smooth", block: 'nearest', inline: 'center'
            })

        lastActive = targetProject;
    }

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            const project = projects.find((project) => project.el == entry.target);
            project.isVisible = entry.isIntersecting;
        }

        setActiveProject(projects.find((project) => project.isVisible));
    }, {
        threshold: [0.0, 1.0],
        rootMargin: "-45%"
    });

    for (const project of projects) {
        observer.observe(project.el);
    }
}
