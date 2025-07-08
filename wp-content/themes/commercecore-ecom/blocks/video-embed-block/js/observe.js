const targets = document.getElementsByClassName('wp-block-cc-video-embed-block');

Array.from(targets).forEach((target) => {
    const videoWrapper = target.querySelector('[data-videos]');
    if (!videoWrapper) return;

    function glideGenerateUrl(value) {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        const filename = value.split('/').pop();
        const ext = filename.split('.').pop();
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        const encoded = btoa(filename).replace(/=/g, '');
        const siteUrl = window.location.origin; // equivalent to get_site_url()

        return `${siteUrl}/img/${encoded}.${ext}`;
    }

    function glideImage(src, args) {
        src = glideGenerateUrl(src);
        const parts = src.split(".");
        let result = parts.slice(0, parts.length - 1).join(".");

        Object.keys(args).forEach((key) => {
            result += `-${key}_${args[key]}`;
        });

        result += `.${parts[parts.length - 1]}`;

        return result;
    }

    const attributes = JSON.parse(videoWrapper.getAttribute('data-videos'));
    const {
        videoId,
        aspectRatio,
        thumbnail
    } = attributes;

    const getPaddingTop = () => {
        switch (aspectRatio) {
            case '1:1':
                return '100%';
            case '4:3':
                return '75%';
            case '16:10':
                return '62.5%';
            case '16:9':
            default:
                return '56.25%';
        }
    };

    Object.assign(videoWrapper.style, {
        position: 'relative',
        overflow: 'hidden',
        paddingTop: getPaddingTop(),
    });

    const thumbnailImg = document.createElement('img');
    thumbnailImg.src = thumbnail ? glideImage(thumbnail, {
        w: 720
    }) : `https://customer-yp8wps06c5vlapon.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`;
    Object.assign(thumbnailImg.style, {
        width: '100%',
        height: '100%',
        display: 'block',
        transition: 'opacity 0.5s ease',
        opacity: '1',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        objectFit: 'cover',
    });

    thumbnailImg.onload = () => {
        thumbnailImg.loading = 'lazy';
        thumbnailImg.width = thumbnailImg.naturalWidth;
        thumbnailImg.height = thumbnailImg.naturalHeight;
    };

    videoWrapper.appendChild(thumbnailImg);

    let hasInteracted = false;
    let hasLoaded = false;

    function loadIframe() {
        if (hasLoaded) return;
        hasLoaded = true;
        thumbnailImg.style.opacity = '0';
        setTimeout(() => {
            videoWrapper.removeChild(thumbnailImg);
            renderIframe(videoWrapper);
        }, 500);
    }

    function onUserInteraction() {
        if (!hasInteracted) {
            hasInteracted = true;
            loadIframe();
            removeListeners();
        }
    }

    function addListeners() {
        ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(event => {
            window.addEventListener(event, onUserInteraction, {
                once: true
            });
        });
    }

    function removeListeners() {
        ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(event => {
            window.removeEventListener(event, onUserInteraction);
        });
    }

    const observer = new IntersectionObserver(
        (entries, observerInstance) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    addListeners();
                    observerInstance.unobserve(videoWrapper);
                }
            });
        }, {
            rootMargin: '200px',
            threshold: 0,
        }
    );

    observer.observe(videoWrapper);
});

function renderIframe(wrapper) {
    const attributes = JSON.parse(wrapper.getAttribute('data-videos'));
    const iframe = document.createElement('iframe');
    iframe.title = 'Embedded Video';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = urlBuilder(attributes);
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.border = '0';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    wrapper.appendChild(iframe);
}

const urlBuilder = (attributes) => {
    const {
        videoId,
        thumbnail,
        controls,
        autoplay,
        loop,
        preload,
        muted
    } = attributes;
    let baseUrl = `https://iframe.videodelivery.net/${videoId}/iframe?`;
    if (!controls) baseUrl += `&controls=false`;
    if (muted) baseUrl += `&muted=true`;
    if (autoplay) baseUrl += `&autoplay=true`;
    if (loop) baseUrl += `&loop=true`;
    if (preload) baseUrl += `&preload=true`;
    if (thumbnail) baseUrl += `&poster=${thumbnail}`;
    return baseUrl;
};