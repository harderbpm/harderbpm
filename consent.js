const cookieBanner = document.getElementById("cookie-banner");
const cookieAccept = document.getElementById("cookie-accept");
const cookieReject = document.getElementById("cookie-reject");

const savedConsent = localStorage.getItem(
  "harderbpm-cookie-consent"
);

if (!savedConsent) {
  cookieBanner.hidden = false;
}

cookieAccept.addEventListener("click", () => {
  localStorage.setItem(
    "harderbpm-cookie-consent",
    "accepted"
  );

  gtag("consent", "update", {
    analytics_storage: "granted"
  });

  cookieBanner.hidden = true;
});

cookieReject.addEventListener("click", () => {
  localStorage.setItem(
    "harderbpm-cookie-consent",
    "necessary"
  );

  gtag("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });

  cookieBanner.hidden = true;
});
