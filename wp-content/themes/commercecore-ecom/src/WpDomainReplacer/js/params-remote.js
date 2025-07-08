function getCookieReplacer(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookiePart = parts.pop();
        return cookiePart ? cookiePart.split(";").shift() : null;
    }
    return null;
}

function addAffParamToCtaLinksReplacer() {
    if (!window.affiliate || !window.entry_url || !domain_replacer) return;

    const replaceTo = domain_replacer.replace_to;

    // Array of cookies to pass to the next domain
    const passableCookies = ["tabId", "newsbreak_cid"];

    let cookieParamString = "";

    // Check if cookie by name exists, if it does create a value to add to next domain URL
    passableCookies.forEach((cookieName) => {
        const cookieValue = getCookieReplacer("cc_param_" + cookieName);
        if (cookieValue) {
            cookieParamString =
                cookieParamString + "&" + cookieName + "=" + cookieValue;
        }
    });

    if (window.EF) {
        const cc_ef_getCookie = (cname) => {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(";");

            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === " ") {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        };

        let args = {
            offer_id: "oid",
            affiliate_id: "affid2",
            sub1: "sub1",
            sub2: "sub2",
            sub3: "sub3",
            sub4: "sub4",
            sub5: "sub5",
            uid: "uid",
            source_id: "source_id",
            transaction_id: "transaction_id",
        };

        for (let i in args) {
            if (args[i]) {
                let efValue = cc_ef_getCookie("ef_" + i);

                if (efValue) {
                    cookieParamString =
                        cookieParamString + "&" + args[i] + "=" + efValue;
                }
            }
        }
    }

    Array.from(document.getElementsByTagName("a")).forEach((link) => {
        let url = link.getAttribute("href") ? .trim() || "";

        if (url.indexOf(replaceTo) !== -1 && url.indexOf("legal") === -1) {
            let separator = url.indexOf("?") !== -1 ? "&" : "?";

            if (url.indexOf("aff") === -1 && url.indexOf("entryUrl") === -1) {
                url +=
                    separator +
                    "aff=" +
                    window.btoa(window.affiliate) +
                    "&entryUrl=" +
                    window.btoa(window.entry_url);
                separator = "&";
            }

            url += separator + "postId=remote" + cookieParamString;
            link.setAttribute("href", url);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    addAffParamToCtaLinksReplacer();
});