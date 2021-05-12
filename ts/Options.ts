document.addEventListener('DOMContentLoaded', async (event) => {
  for (const div of document.getElementById("main")?.children as HTMLCollectionOf<HTMLElement>) {
    div.style.display = "none";
  }

  const initError: InitErrorT = await browser.runtime.sendMessage({ From: "options", Command: "initError" }).catch();
  switch (initError) {
    case "NoBrowserName":
      changeVisibleDiv("initButtonWrap");
      break;
    case "NotInstalled":
      changeVisibleDiv("notInstalled");
      break;
    default:
      changeVisibleDiv("default");
      break;
  }
});

document.getElementById("initButton")?.addEventListener("click", async () => {
  const sending = await browser.runtime.sendMessage({ From: "options", Command: "requestBrowserName" }).catch();
  changeVisibleDiv("waiting");
  await Thread.Delay(1000);
  changeVisibleDiv("initEnd");
});

const changeVisibleDiv = (divId: string) => {
  if (visibleDiv !== undefined) {
    visibleDiv.style.display = "none";
  }
  visibleDiv = document.getElementById(divId) as HTMLElement
  visibleDiv.style.display = "block";
}

let visibleDiv: HTMLElement | undefined = undefined;