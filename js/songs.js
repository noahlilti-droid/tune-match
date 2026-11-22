/* Abbey Road (1969): chord charts for all 17 tracks.
   Lyrics are NOT included (they are copyrighted). Each vocal line has an empty slot
   that the player fills from their own copy of the lyrics.

   Line syntax:  "C:4 Cmaj7:4"   → chord C for 4 beats, then Cmaj7 for 4 beats.
                 A leading "~" marks an instrumental line (no lyrics).
   form entries: [section label, part key, { repeat, bpm }]
   conf: 'solide' = well-known chart, 'à vérifier' = simplified transcription. */
window.ALBUM = {
  title: 'Abbey Road',
  artist: 'The Beatles',
  year: 1969,
  songs: [
    {
      id: 'come-together', title: 'Come Together', writer: 'Lennon–McCartney', voice: 'John Lennon',
      length: '4:20', key: 'Ré mineur', bpm: 82, meter: '4/4', capo: 0, conf: 'solide',
      tip: 'Le riff de basse sur Dm porte tout le morceau : gardez la main droite légère et étouffée.',
      parts: {
        I: ['~Dm:4 Dm:4', '~Dm:4 Dm:4'],
        V: ['Dm:4 Dm:4', 'Dm:4 Dm:4', 'A7:4 A7:4', 'G7:4 G7:4', '~Dm:4 Dm:4'],
        C: ['Bm:4 Bm:4', 'A:4 G:4', 'A:4 A:4', '~Dm:4 Dm:4'],
        S: ['~Dm:4 Dm:4', '~Dm:4 Dm:4', '~A7:4 A7:4', '~G7:4 G7:4'],
        O: ['Bm:4 Bm:4', 'A:4 G:4', '~Dm:4 Dm:4', '~Dm:4 Dm:4']
      },
      form: [['Intro', 'I'], ['Couplet 1', 'V'], ['Couplet 2', 'V'], ['Refrain', 'C'], ['Couplet 3', 'V'],
        ['Refrain', 'C'], ['Solo', 'S'], ['Couplet 4', 'V'], ['Refrain', 'C'], ['Outro', 'O']]
    },
    {
      id: 'something', title: 'Something', writer: 'George Harrison', voice: 'George Harrison',
      length: '3:03', key: 'Do majeur', bpm: 66, meter: '4/4', capo: 0, conf: 'solide',
      tip: 'La descente C → Cmaj7 → C7 se joue en ne bougeant qu’un doigt : laissez sonner les autres cordes.',
      parts: {
        I: ['~F:2 Eb:1 G:1'],
        V: ['C:4 Cmaj7:4', 'C7:4 F:4', 'D:4 G:4', 'Am:4 AmMaj7:4', 'Am7:4 D9:4', '~F:2 Eb:1 G:1'],
        B: ['A:4 C#m:4', 'F#m:4 A:4', 'D:4 G:4', 'A:4 A:4', '~F:2 Eb:1 G:1'],
        S: ['~C:4 Cmaj7:4', '~C7:4 F:4', '~D:4 G:4', '~Am:4 AmMaj7:4', '~Am7:4 D9:4', '~F:2 Eb:1 G:1'],
        O: ['~C:4 Cmaj7:4', '~F:2 Eb:1 G:1', '~C:8']
      },
      form: [['Intro', 'I'], ['Couplet 1', 'V'], ['Couplet 2', 'V'], ['Pont', 'B'], ['Solo', 'S'],
        ['Couplet 3', 'V'], ['Outro', 'O']]
    },
    {
      id: 'maxwells-silver-hammer', title: 'Maxwell’s Silver Hammer', writer: 'Lennon–McCartney', voice: 'Paul McCartney',
      length: '3:27', key: 'Ré majeur', bpm: 130, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Jeu « music-hall » : accords plaqués sur les temps 2 et 4.',
      parts: {
        I: ['~D:4 B7:4', '~Em:4 A7:4'],
        V: ['D:4 B7:4', 'Em:4 A7:4', 'Em:4 A7:4', 'D:4 B7:4', 'Em:4 A7:4', 'D:4 D:4', 'E7:4 E7:4', 'A7:4 A7:4'],
        C: ['D:4 D:4', 'E7:4 E7:4', 'A7:4 A7:4', 'Em:4 A7:4', 'D:4 D:4'],
        S: ['~D:4 B7:4', '~Em:4 A7:4', '~D:4 A7:4', '~D:4 D:4'],
        O: ['~D:4 A7:4', '~D:8']
      },
      form: [['Intro', 'I'], ['Couplet 1', 'V'], ['Refrain', 'C'], ['Couplet 2', 'V'], ['Refrain', 'C'],
        ['Solo', 'S'], ['Couplet 3', 'V'], ['Refrain', 'C'], ['Outro', 'O']]
    },
    {
      id: 'oh-darling', title: 'Oh! Darling', writer: 'Lennon–McCartney', voice: 'Paul McCartney',
      length: '3:27', key: 'La majeur', bpm: 56, meter: '12/8', capo: 0, conf: 'solide',
      tip: 'En 12/8 : comptez 4 temps par mesure et jouez trois croches par temps (feeling doo-wop).',
      parts: {
        I: ['~E+:4'],
        V: ['A:4 E:4', 'F#m:4 D:4', 'Bm7:4 E7:4', 'Bm7:4 E7:4 A:2 D:2 A:2 E:2'],
        B: ['F:4 F:4', 'A:4 A:4', 'B7:4 B7:4', 'E7:4 E7:4'],
        O: ['~A:4 D:4', '~A:8']
      },
      form: [['Intro', 'I'], ['Couplet 1', 'V'], ['Couplet 2', 'V'], ['Pont', 'B'], ['Couplet 3', 'V'],
        ['Pont', 'B'], ['Couplet 4', 'V'], ['Outro', 'O']]
    },
    {
      id: 'octopuss-garden', title: 'Octopus’s Garden', writer: 'Richard Starkey', voice: 'Ringo Starr',
      length: '2:51', key: 'Mi majeur', bpm: 90, meter: '4/4', capo: 0, conf: 'solide',
      tip: 'Grille I–vi–IV–V en Mi : idéal pour travailler le barré de C#m.',
      parts: {
        I: ['~E:4 C#m:4', '~A:4 B:4'],
        V: ['E:4 C#m:4', 'A:4 B:4', 'E:4 C#m:4', 'A:4 B:4'],
        R: ['C#m:4 C#m:4', 'A:4 B:4', 'E:4 C#m:4', 'A:4 B:4 E:4'],
        S: ['~E:4 C#m:4', '~A:4 B:4', '~E:4 C#m:4', '~A:4 B:4'],
        O: ['A:4 B:4', 'A:4 B:4 E:4']
      },
      form: [['Intro', 'I'], ['Couplet 1', 'V'], ['Refrain', 'R'], ['Couplet 2', 'V'], ['Refrain', 'R'],
        ['Solo', 'S'], ['Couplet 3', 'V'], ['Refrain', 'R'], ['Outro', 'O']]
    },
    {
      id: 'i-want-you', title: 'I Want You (She’s So Heavy)', writer: 'Lennon–McCartney', voice: 'John Lennon',
      length: '7:47', key: 'La mineur / Ré mineur', bpm: 58, meter: '12/8', capo: 0, conf: 'à vérifier',
      tip: 'Le riff « heavy » final tourne en boucle : concentrez-vous sur la régularité.',
      parts: {
        H: ['~Dm:4 Dm/C:4', '~Bb7:4 E7:4'],
        V: ['Am7:4 Am7:4', 'Dm7:4 Dm7:4', 'E7:4 E7:4', 'Bb7:4 E7:4'],
        S: ['Dm:4 Dm/C:4', 'Bb7:4 E7:4'],
        G: ['~Am7:4 Dm7:4', '~E7:4 Bb7:4'],
        X: ['~Dm:4 Dm/C:4 Bb7:4 E7:4']
      },
      form: [['Intro', 'H'], ['Couplet 1', 'V'], ['Couplet 2', 'V'], ['She’s so heavy', 'S'], ['Couplet 3', 'V'],
        ['Couplet 4', 'V'], ['She’s so heavy', 'S'], ['Solo', 'G', { repeat: 2 }], ['Couplet 5', 'V'],
        ['She’s so heavy', 'S'], ['Outro (riff en boucle)', 'X', { repeat: 14 }]]
    },
    {
      id: 'here-comes-the-sun', title: 'Here Comes the Sun', writer: 'George Harrison', voice: 'George Harrison',
      length: '3:05', key: 'La majeur', bpm: 129, meter: '4/4', capo: 7, conf: 'solide',
      tip: 'Capo 7 : les formes deviennent D, G, A7. Le pont original alterne des mesures impaires (11/8, 7/8), simplifiées ici en 4/4.',
      parts: {
        I: ['~A:4 D:4', '~E7:4 A:4'],
        V: ['A:4 D:4 E7:4 E7:4', 'A:4 D:4 E7:4 E7:4'],
        C: ['A:4 A:4', 'D:4 B7:4', 'A:4 A:4', '~D:4 E7:4'],
        B: ['C:4 G:4 D:4 A:4', 'C:4 G:4 D:4 A:4', 'C:4 G:4 D:4 A:4', '~E7:8'],
        O: ['~C:4 G:4 D:4 A:4', '~A:8']
      },
      form: [['Intro', 'I'], ['Couplet 1', 'V'], ['Refrain', 'C'], ['Couplet 2', 'V'], ['Refrain', 'C'],
        ['Pont', 'B'], ['Interlude', 'I'], ['Couplet 3', 'V'], ['Refrain', 'C', { repeat: 2 }], ['Outro', 'O']]
    },
    {
      id: 'because', title: 'Because', writer: 'Lennon–McCartney', voice: 'Lennon, McCartney, Harrison',
      length: '2:45', key: 'Do♯ mineur', bpm: 66, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Arpèges lents, une note par croche. Laissez chaque accord résonner.',
      parts: {
        I: ['~C#m:4 C#m:4', '~D#m7b5:4 G#7:4'],
        V: ['C#m:4 C#m:4', 'D#m7b5:4 G#7:4', 'A:4 A7:4', 'D:4 Ddim:4', 'C#m:4 C#m:4'],
        B: ['D:4 D:4', 'Ddim:4 Ddim:4', 'A:4 A:4', 'D:4 D:4'],
        O: ['~C#m:4 D#m7b5:4', '~G#7:4 C#m:4']
      },
      form: [['Intro', 'I'], ['Couplet 1', 'V'], ['Couplet 2', 'V'], ['Pont', 'B'], ['Couplet 3', 'V'], ['Outro', 'O']]
    },
    {
      id: 'you-never-give-me-your-money', title: 'You Never Give Me Your Money', writer: 'Lennon–McCartney', voice: 'Paul McCartney',
      length: '4:02', key: 'La mineur → Do', bpm: 76, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Morceau en plusieurs parties : le tempo change en cours de route (géré automatiquement).',
      parts: {
        A: ['Am7:4 Dm7:4', 'G7:4 Cmaj7:4', 'Fmaj7:4 Bm7b5:4', 'E7:4 Am:4'],
        T: ['~C:4 G:4', '~Am:4 E7:4'],
        B: ['C:4 C:4', 'F:4 C:4', 'C:4 C:4', 'G7:4 C:4'],
        M: ['A:4 A:4', 'D:4 E7:4'],
        D: ['C:4 G:4', 'Am:4 F:4', 'C:4 G:4', 'Am:4 F:4', 'Bb:4 F:4', 'C:4 C:4'],
        O: ['A:4 D:4', 'A:4 E7:4', '~A:4 D:4']
      },
      form: [['Partie 1', 'A'], ['Partie 1 (bis)', 'A'], ['Transition', 'T', { bpm: 110 }],
        ['Partie 2', 'B', { bpm: 110 }], ['Partie 3', 'M', { bpm: 110 }], ['Partie 4', 'D', { bpm: 116 }],
        ['Outro', 'O', { bpm: 116, repeat: 2 }]]
    },
    {
      id: 'sun-king', title: 'Sun King', writer: 'Lennon–McCartney', voice: 'John Lennon',
      length: '2:26', key: 'Mi → Do', bpm: 64, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Ambiance planante : accords tenus, attaques douces.',
      parts: {
        I: ['~E:4 E:4', '~E:4 E:4'],
        V: ['E:4 E:4', 'C:4 C:4', 'E:4 E:4', 'C:4 C:4'],
        S: ['C:4 Cmaj7:4', 'Dm7:4 G7:4', 'C:4 Cmaj7:4', 'Dm7:4 G7:4', '~C:8']
      },
      form: [['Intro', 'I'], ['Couplet', 'V'], ['Partie en « espagnol »', 'S'], ['Couplet', 'V'], ['Final', 'S']]
    },
    {
      id: 'mean-mr-mustard', title: 'Mean Mr. Mustard', writer: 'Lennon–McCartney', voice: 'John Lennon',
      length: '1:06', key: 'Mi majeur', bpm: 112, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Enchaîné avec Polythene Pam : préparez la transition.',
      parts: {
        V: ['E:4 E:4', 'D:4 D:4', 'E:4 E:4', 'A:4 B7:4', 'E:4 E:4']
      },
      form: [['Couplet 1', 'V'], ['Couplet 2', 'V'], ['Couplet 3', 'V']]
    },
    {
      id: 'polythene-pam', title: 'Polythene Pam', writer: 'Lennon–McCartney', voice: 'John Lennon',
      length: '1:12', key: 'Mi majeur', bpm: 128, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Grattage acoustique énergique sur la cellule E – D – A.',
      parts: {
        I: ['~D:2 A:2 E:4', '~D:2 A:2 E:4'],
        V: ['E:4 D:2 A:2', 'E:4 D:2 A:2', 'E:4 D:2 A:2', 'E:4 D:2 A:2', 'B:4 B:4']
      },
      form: [['Intro', 'I'], ['Couplet 1', 'V'], ['Couplet 2', 'V'], ['Solo', 'I', { repeat: 2 }]]
    },
    {
      id: 'she-came-in-through-the-bathroom-window', title: 'She Came In Through the Bathroom Window',
      writer: 'Lennon–McCartney', voice: 'Paul McCartney',
      length: '1:57', key: 'La majeur', bpm: 120, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Tempo rapide : anticipez chaque changement d’un demi-temps.',
      parts: {
        V: ['A:4 A:4', 'C:4 D:4', 'A:4 A:4', 'C:4 D:4'],
        R: ['D:4 D:4', 'A:4 A:4', 'C:4 G:4', 'D:4 A:4']
      },
      form: [['Couplet 1', 'V'], ['Refrain', 'R'], ['Couplet 2', 'V'], ['Refrain', 'R'], ['Couplet 3', 'V'], ['Refrain', 'R']]
    },
    {
      id: 'golden-slumbers', title: 'Golden Slumbers', writer: 'Lennon–McCartney', voice: 'Paul McCartney',
      length: '1:31', key: 'La mineur → Do', bpm: 76, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Au piano, c’est le morceau idéal pour les accords à 4 sons (Am7, Dm7, G7).',
      parts: {
        V: ['Am7:4 Dm7:4', 'G7:4 C:4', 'E7:4 Am:4', 'Dm7:4 G7:4 C:4'],
        R: ['C:4 F:4', 'C:4 F:4', 'E7:4 Am:4', 'Dm7:4 G7:4 C:4']
      },
      form: [['Couplet', 'V'], ['Refrain', 'R'], ['Couplet', 'V']]
    },
    {
      id: 'carry-that-weight', title: 'Carry That Weight', writer: 'Lennon–McCartney', voice: 'Les quatre Beatles',
      length: '1:36', key: 'Do majeur', bpm: 92, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'La partie centrale reprend la grille de « You Never Give Me Your Money ».',
      parts: {
        R: ['C:4 C:4', 'G:4 G:4', 'G7:4 G7:4', 'C:4 C:4'],
        M: ['Am7:4 Dm7:4', 'G7:4 Cmaj7:4', 'Fmaj7:4 Bm7b5:4', 'E7:4 Am:4'],
        G: ['~C:4 G:4', '~Am:4 E7:4']
      },
      form: [['Refrain', 'R'], ['Reprise', 'M'], ['Guitares', 'G'], ['Refrain', 'R']]
    },
    {
      id: 'the-end', title: 'The End', writer: 'Lennon–McCartney', voice: 'Paul McCartney',
      length: '2:05', key: 'La → Do', bpm: 124, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Solo de batterie puis duel de guitares sur A7 – D7, avant le final au piano.',
      parts: {
        I: ['A:4 A:4', 'D:4 D:4'],
        D: ['~A7:4 A7:4', '~A7:4 A7:4'],
        G: ['~A7:4 D7:4'],
        E: ['C:4 C:4', 'Dm7:4 Dm7:4', 'F:4 G:4', 'C:4 C:4'],
        O: ['~F:4 G:4', '~C:8']
      },
      form: [['Intro', 'I'], ['Solo de batterie', 'D', { repeat: 2 }], ['Duel de guitares', 'G', { repeat: 12 }],
        ['Final', 'E', { bpm: 80 }], ['Outro', 'O', { bpm: 80 }]]
    },
    {
      id: 'her-majesty', title: 'Her Majesty', writer: 'Lennon–McCartney', voice: 'Paul McCartney',
      length: '0:23', key: 'Ré majeur', bpm: 100, meter: '4/4', capo: 0, conf: 'à vérifier',
      tip: 'Picking folk rapide, en piste cachée à la fin de l’album.',
      parts: {
        V: ['D:4 Bm:4', 'Em:4 A7:4', 'D:4 B7:4', 'E7:4 A7:4', 'D:4 D7:4', 'G:4 Gm:4', 'D:4 B7:4', 'E7:2 A7:2 D:4']
      },
      form: [['Chanson', 'V']]
    }
  ]
};
