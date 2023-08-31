const OpenCC = require('opencc-js');

const simplifier = OpenCC.Converter({from: 'hk', to: 'cn'})

function simplify(text: string) {
  return simplifier(text)
}

function getLyricsElement() {
  return document.querySelectorAll('div.lyrics-lyricsContent-lyric')
}

// TODO: Get rid of this / keep it since it potentially returns early?
function getLyricsText() {
  const lyrics = getLyricsElement()

  if(!lyrics) return null

  var lyrics_text = String()
  for (let lyric of lyrics) lyrics_text += lyric.innerHTML + "\n"
  lyrics_text = lyrics_text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")

  return lyrics_text 
}

function simplifyAllLyrics() {
  const lyrics = getLyricsElement()

  if(!lyrics) return null

  for (let lyric of lyrics) lyric.innerHTML = simplify(lyric.innerHTML);
}

function untilLyrics() {      
  let lyrics;
  if((lyrics = getLyricsText()) == null) {setTimeout(untilLyrics, 100)}
  return lyrics;
}

async function main() {
  while (!Spicetify?.showNotification) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log("Hello, world!")

  // Show message on start.
  Spicetify.showNotification("Hello from Simpify!")

  while (true) {
    // Don't freeze the app
    await new Promise(resolve => setTimeout(resolve, 100))

    let current_lyrics = untilLyrics()
    
    if(current_lyrics == "") {
      Spicetify.showNotification("Lyrics are empty :(")
    }

    if(current_lyrics == null) continue;

    Spicetify.showNotification("Converting lyrics...");
    
    simplifyAllLyrics();
    
    let untilChanged = async () => {
      // Don't freeze the app
      await new Promise(resolve => setTimeout(resolve, 100))
      if(current_lyrics == untilLyrics()) {
        await untilChanged()
      } else {
        return;
      }
    }
    await untilChanged(); /* When they do change, start over */
  }
}

export default main;