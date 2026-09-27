/**
 * Stories of the 25 prophets named in the Qur'an, told from the Qur'an alone.
 *
 * Every chapter cites the ayat it retells (`refs`, e.g. "7:11-18"). Quotations are Saheeh International
 * with bracketed glosses dropped, and were checked verbatim against the cited ayat. Details that come only
 * from hadith or later tradition (names the Qur'an does not give, etc.) are deliberately left out.
 * Order is the traditional one; the Qur'an does not fix the chronology of every prophet.
 */

export interface StoryChapter {
  title: string;
  body: string;
  /** Ayah references, "surah:ayah" or "surah:from-to". */
  refs: string[];
}

export interface ProphetStory {
  slug: string;
  /** Matches `prophet_name` in ayah_pairings, so stories can link to that prophet's duas. */
  name: string;
  intro: string;
  chapters: StoryChapter[];
}

export const PROPHET_STORIES: ProphetStory[] = [
  {
    slug: "adam",
    name: "Adam",
    intro: "The first human being, whom Allah chose (3:33). His story is the story of every person who slips and then turns back to their Lord.",
    chapters: [
      {
        title: "A successor on earth",
        body: "Allah told the angels He would place a successive authority on the earth. They asked whether He would place there one who would cause corruption and shed blood, and He answered, \"Indeed, I know that which you do not know.\" He taught Adam the names of all things, and when the angels could not name them, Adam informed them.",
        refs: ["2:30-33"],
      },
      {
        title: "The refusal of Iblees",
        body: "Allah commanded the angels to prostrate to Adam, and they prostrated, except for Iblees. He said, \"I am better than him. You created me from fire and created him from clay.\" Expelled for his arrogance, he asked for respite until the Day of Resurrection and vowed to sit in wait for people on the straight path.",
        refs: ["2:34", "7:11-18"],
      },
      {
        title: "The garden and the tree",
        body: "Adam and his wife were told to live in Paradise and eat freely from it, but not to approach one tree, and Allah warned them that Satan was an enemy to them. Satan whispered to them and swore he was a sincere adviser, claiming they had only been forbidden the tree so they would not become angels or immortal. They ate from it, and their nakedness became apparent to them.",
        refs: ["2:35", "7:19-22", "20:117-121"],
      },
      {
        title: "Words of repentance",
        body: "Their response was not an excuse but a confession: \"Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.\" Adam received words from his Lord, and Allah accepted his repentance, chose him and guided him.",
        refs: ["7:23", "2:37", "20:122"],
      },
      {
        title: "Life on earth",
        body: "Adam and his wife were sent down to the earth, to live and die there and be brought forth from it again. Allah promised that guidance would come to them, and that whoever follows it will have no fear and will not grieve.",
        refs: ["2:36-38", "7:24-25", "20:123"],
      },
      {
        title: "The two sons of Adam",
        body: "Two sons of Adam each made an offering; it was accepted from one of them and not the other. The one whose offering was rejected threatened to kill his brother, who answered that he would not raise his hand against him, for he feared Allah. He killed him anyway, and when Allah sent a crow scratching the ground to show him how to bury his brother, he said, \"O woe to me!\" and became of the regretful.",
        refs: ["5:27-31"],
      },
    ],
  },
  {
    slug: "idris",
    name: "Idris",
    intro: "The Qur'an mentions Idris only briefly, but in the highest terms. It does not narrate the events of his life.",
    chapters: [
      {
        title: "A man of truth",
        body: "Allah describes Idris as \"a man of truth and a prophet,\" and says, \"We raised him to a high station.\" He is named with Isma'il and Dhul-Kifl as those who were all of the patient, whom Allah admitted into His mercy, for they were of the righteous.",
        refs: ["19:56-57", "21:85-86"],
      },
    ],
  },
  {
    slug: "nuh",
    name: "Nuh",
    intro: "Nuh called his people to Allah for nine hundred and fifty years, and built the ship that carried the believers through the flood.",
    chapters: [
      {
        title: "Night and day",
        body: "Nuh was sent to warn his people and call them to worship Allah alone. He invited them night and day, publicly and in secret, telling them that if they asked forgiveness, Allah would send rain and give them wealth, children, gardens and rivers. Instead, they put their fingers in their ears, covered themselves with their garments and grew more arrogant.",
        refs: ["71:1-12"],
      },
      {
        title: "Mocked by the leaders",
        body: "The leaders of his people said he was only a man like them, followed only by the lowest of them, and possessed by madness. They told each other never to leave their gods Wadd, Suwa', Yaghuth, Ya'uq and Nasr. Nuh refused to drive away the believers they looked down on, saying, \"Indeed, they will meet their Lord.\"",
        refs: ["11:27-31", "23:24-25", "71:21-23"],
      },
      {
        title: "Building the ship",
        body: "It was revealed to Nuh that no more of his people would believe, and he was commanded to build the ship under Allah's observation. Whenever the leaders of his people passed by, they ridiculed him. He had remained among them a thousand years minus fifty.",
        refs: ["11:36-38", "29:14"],
      },
      {
        title: "The flood",
        body: "When Allah's command came and the oven overflowed, Nuh loaded the ship with a pair of every creature, his family, except those against whom the decree had gone, and the believers, though only a few had believed. He said, \"In the name of Allah are its course and its anchorage.\" The gates of the heaven opened with pouring rain, the earth burst with springs, and the ship sailed through waves like mountains.",
        refs: ["11:40-42", "54:11-12"],
      },
      {
        title: "His son",
        body: "Nuh called to his son, who stood apart: \"O my son, come aboard with us and be not with the disbelievers.\" His son said he would take refuge on a mountain, and the waves came between them. When Nuh asked his Lord about him, he was told that his son was not of his family, for his work was other than righteous, and Nuh sought refuge in Allah from asking about what he had no knowledge of. The Qur'an also gives Nuh's wife as an example of those who disbelieved.",
        refs: ["11:42-47", "66:10"],
      },
      {
        title: "A blessed landing",
        body: "The earth swallowed its water, the sky withheld its rain, and the ship came to rest on al-Judiyy. Allah had taught Nuh to say, \"My Lord, let me land at a blessed landing place,\" and he was told to disembark \"in security from Us and blessings upon you\" and upon nations descending from those with him.",
        refs: ["11:44", "11:48", "23:28-29"],
      },
    ],
  },
  {
    slug: "hud",
    name: "Hud",
    intro: "Hud was sent to 'Ad, a people of great strength who came after the people of Nuh, in the region of al-Ahqaf.",
    chapters: [
      {
        title: "A people of strength",
        body: "Allah made 'Ad successors after the people of Nuh and increased them in stature. Hud, one of their own, called them to worship Allah alone and to ask His forgiveness, promising rain and strength added to their strength.",
        refs: ["7:65", "7:69", "11:50-52", "46:21"],
      },
      {
        title: "Rejection",
        body: "Their leaders said they saw him in foolishness and thought him a liar, and claimed some of their gods had possessed him. They refused to leave what their fathers had worshipped. Hud declared himself free of their idols and said, \"I have relied upon Allah, my Lord and your Lord.\"",
        refs: ["7:66-70", "11:53-56"],
      },
      {
        title: "The wind",
        body: "When they saw a cloud approaching their valleys, they said, \"This is a cloud bringing us rain!\" It was a wind carrying a painful punishment, imposed on them for seven nights and eight days, until nothing was seen of them except their dwellings. Allah saved Hud and those who believed with him.",
        refs: ["46:24-25", "69:6-7", "11:58"],
      },
    ],
  },
  {
    slug: "salih",
    name: "Salih",
    intro: "Salih was sent to Thamud, who came after 'Ad and carved their homes from the mountains.",
    chapters: [
      {
        title: "A man of promise",
        body: "Thamud had been settled in the land after 'Ad, taking palaces from its plains and carving homes from the mountains. When Salih called them to worship Allah alone, they said, \"you were among us a man of promise before this,\" and refused to leave what their fathers worshipped.",
        refs: ["7:73-74", "11:61-62"],
      },
      {
        title: "The she-camel of Allah",
        body: "Salih brought them a sign: the she-camel of Allah. She was to be left to feed on Allah's earth, with her own day to drink and theirs on another, and they were warned not to touch her with harm.",
        refs: ["7:73", "26:155-156", "91:13"],
      },
      {
        title: "The plot",
        body: "Nine family heads in the city swore an oath to kill Salih and his family by night and then deny it. The most wretched of them was sent forth, and they hamstrung the she-camel and challenged Salih to bring what he had promised.",
        refs: ["27:48-50", "91:12-14", "7:77"],
      },
      {
        title: "Three days",
        body: "Salih told them, \"Enjoy yourselves in your homes for three days.\" Then the shriek seized those who had wronged, and they lay fallen in their homes. Allah saved Salih and those who believed with him, and Salih turned away saying, \"I had certainly conveyed to you the message of my Lord and advised you, but you do not like advisors.\"",
        refs: ["11:65-67", "7:78-79"],
      },
    ],
  },
  {
    slug: "ibrahim",
    name: "Ibrahim",
    intro: "Allah took Ibrahim as an intimate friend (4:125). He stood alone against the idols of his people, was saved from the fire, and with his son raised the foundations of the House.",
    chapters: [
      {
        title: "O my father",
        body: "Ibrahim asked his father Azar why he took idols as gods, and gently urged him, \"O my father, why do you worship that which does not hear and does not see and will not benefit you at all?\" His father threatened to stone him, and Ibrahim answered, \"Peace will be upon you. I will ask forgiveness for you of my Lord.\"",
        refs: ["6:74", "19:42-47"],
      },
      {
        title: "The star, the moon and the sun",
        body: "Allah showed Ibrahim the realm of the heavens and the earth. Watching a star, then the moon, then the sun rise and set, he declared that he would not worship what disappears, and said, \"I have turned my face toward He who created the heavens and the earth, inclining toward truth.\"",
        refs: ["6:75-79"],
      },
      {
        title: "Breaking the idols",
        body: "While his people were away, Ibrahim broke their idols into fragments, all except the largest. When they questioned him, he said, \"Rather, this - the largest of them - did it, so ask them, if they should be able to speak.\" For a moment they turned to blaming themselves, then said, \"You have already known that these do not speak!\"",
        refs: ["21:57-66"],
      },
      {
        title: "The fire",
        body: "His people said, \"Burn him and support your gods,\" and resolved to throw him into a blazing fire. But Allah said, \"O fire, be coolness and safety upon Abraham.\" They intended harm for him, and Allah made them the greatest losers.",
        refs: ["21:68-70", "37:97-98"],
      },
      {
        title: "Debating a king",
        body: "A man to whom Allah had given kingship argued with Ibrahim about his Lord. When Ibrahim said his Lord gives life and causes death, the man claimed to do the same. Ibrahim replied, \"Indeed, Allah brings up the sun from the east, so bring it up from the west,\" and the disbeliever was overwhelmed.",
        refs: ["2:258"],
      },
      {
        title: "The honoured guests",
        body: "Messengers came to Ibrahim, and he hurried to bring them a roasted calf. When they did not eat, he felt afraid, but they told him they had been sent to the people of Lut, and gave his wife, an old woman, the good tidings of Ishaq, and after him Ya'qub. Ibrahim, \"forbearing, grieving and returning\" to Allah, pleaded for the people of Lut, but the command had already come.",
        refs: ["11:69-76"],
      },
      {
        title: "The dream",
        body: "Ibrahim asked Allah for a righteous child and was given good tidings of a forbearing boy. When the boy was old enough to work with him, Ibrahim told him he had seen in a dream that he must sacrifice him. The son replied, \"O my father, do as you are commanded. You will find me, if Allah wills, of the steadfast.\" When both had submitted, Allah called out that he had fulfilled the vision, and ransomed the son with a great sacrifice.",
        refs: ["37:99-107"],
      },
      {
        title: "Raising the House",
        body: "Ibrahim settled some of his descendants in an uncultivated valley near the Sacred House. With Isma'il he raised its foundations, praying, \"Our Lord, accept this from us,\" and asked Allah to send among their descendants a messenger who would recite His verses and teach them the Book and wisdom.",
        refs: ["14:37", "2:125-129"],
      },
    ],
  },
  {
    slug: "lut",
    name: "Lut",
    intro: "Lut believed in Ibrahim and was delivered with him to a blessed land, then sent to a people whose immorality no nation had committed before them.",
    chapters: [
      {
        title: "Believing with Ibrahim",
        body: "When Ibrahim called his people to Allah, Lut believed him, and Allah delivered them both to the land He had blessed for the worlds.",
        refs: ["29:26", "21:71"],
      },
      {
        title: "A message to his people",
        body: "Lut was sent to a people who approached men with desire instead of women, obstructed the road and committed evil in their gatherings. He called them to fear Allah, asking no payment. Their only answer was, \"Evict them from your city! Indeed, they are men who keep themselves pure.\"",
        refs: ["7:80-82", "29:28-29", "26:161-167"],
      },
      {
        title: "The guests",
        body: "When the messengers came to Lut, he did not recognise them, and he was distressed for them, calling it \"a trying day.\" His people came hastening to him, and he pleaded with them not to disgrace him concerning his guests, wishing he had the strength to stop them. The messengers told him, \"O Lot, indeed we are messengers of your Lord; they will never reach you.\"",
        refs: ["15:61-62", "11:77-81", "54:37"],
      },
      {
        title: "Leaving by night",
        body: "Lut was told to set out with his family during a portion of the night and let none of them look back, except his wife, who would be struck by what struck them. By morning the city was overturned and stones of hard clay rained upon it. Allah saved Lut and his family before dawn.",
        refs: ["11:81-82", "15:65-66", "54:34"],
      },
    ],
  },
  {
    slug: "ismail",
    name: "Isma'il",
    intro: "Isma'il, son of Ibrahim, \"was true to his promise, and he was a messenger and a prophet\" (19:54).",
    chapters: [
      {
        title: "A son in old age",
        body: "Ibrahim praised Allah \"who has granted to me in old age Ishmael and Isaac. Indeed, my Lord is the Hearer of supplication.\"",
        refs: ["14:39"],
      },
      {
        title: "Raising the foundations",
        body: "Allah charged Ibrahim and Isma'il to purify His House for those who circle it, stay there for worship, bow and prostrate. Together they raised its foundations, praying, \"Our Lord, accept this from us,\" and asking to be made Muslims in submission to Him, and their descendants a Muslim nation.",
        refs: ["2:125-128"],
      },
      {
        title: "The sacrifice",
        body: "The Qur'an tells of a forbearing son who, when his father told him of the dream commanding his sacrifice, said, \"O my father, do as you are commanded. You will find me, if Allah wills, of the steadfast.\" The passage does not name him, but the good tidings of Ishaq are given only after it (37:112), and most scholars understand this son to be Isma'il.",
        refs: ["37:101-107", "37:112"],
      },
      {
        title: "True to his promise",
        body: "Isma'il used to enjoin prayer and zakah on his people and was pleasing to his Lord. He is named among the patient and the righteous, and among the outstanding.",
        refs: ["19:54-55", "21:85-86", "38:48"],
      },
    ],
  },
  {
    slug: "ishaq",
    name: "Ishaq",
    intro: "Ishaq, a son of Ibrahim, was given to his parents as good tidings in their old age.",
    chapters: [
      {
        title: "Good tidings",
        body: "When the messengers visited Ibrahim, his wife was standing nearby, and they gave her good tidings of Ishaq, and after Ishaq, Ya'qub. She said, \"Shall I give birth while I am an old woman and this, my husband, is an old man?\" They answered, \"Are you amazed at the decree of Allah? May the mercy of Allah and His blessings be upon you, people of the house.\"",
        refs: ["11:71-73", "51:28-30"],
      },
      {
        title: "A prophet among the righteous",
        body: "Allah gave Ibrahim good tidings of Ishaq, \"a prophet from among the righteous,\" and blessed both Ibrahim and Ishaq. Ishaq and Ya'qub were made leaders guiding by Allah's command, inspired to do good deeds, establish prayer and give zakah.",
        refs: ["37:112-113", "21:72-73", "19:49"],
      },
    ],
  },
  {
    slug: "yaqub",
    name: "Ya'qub",
    intro: "Ya'qub, son of Ishaq and father of Yusuf, lived through a long grief without despairing of Allah.",
    chapters: [
      {
        title: "A father's warning",
        body: "When young Yusuf told him of a dream in which eleven stars, the sun and the moon prostrated to him, Ya'qub told him not to relate it to his brothers, lest they plot against him, and told him that Allah would choose him and complete His favour upon the family of Ya'qub.",
        refs: ["12:4-6"],
      },
      {
        title: "Patience is most fitting",
        body: "Yusuf's brothers came to their father at night, weeping, with false blood on his shirt and a story of a wolf. Ya'qub said, \"Rather, your souls have enticed you to something, so patience is most fitting. And Allah is the one sought for help against that which you describe.\"",
        refs: ["12:16-18"],
      },
      {
        title: "Complaining only to Allah",
        body: "Later, when Yusuf's brother was held in Egypt, Ya'qub turned away and said, \"Oh, my sorrow over Joseph,\" and his eyes became white from grief. When his sons said he would never stop remembering Yusuf, he answered, \"I only complain of my suffering and my grief to Allah,\" and sent them to search, saying, \"despair not of relief from Allah.\"",
        refs: ["12:83-87"],
      },
      {
        title: "Sight restored",
        body: "Yusuf sent his shirt back with his brothers. As the caravan left Egypt, Ya'qub said, \"Indeed, I find the smell of Joseph.\" When the shirt was cast over his face, he could see again, and he promised his sons, \"I will ask forgiveness for you from my Lord.\" The family was reunited in Egypt, where Yusuf raised his parents upon the throne.",
        refs: ["12:93-100"],
      },
      {
        title: "His final counsel",
        body: "When death approached, Ya'qub asked his sons, \"What will you worship after me?\" They answered, \"We will worship your God and the God of your fathers, Abraham and Ishmael and Isaac - one God.\"",
        refs: ["2:132-133"],
      },
    ],
  },
  {
    slug: "yusuf",
    name: "Yusuf",
    intro: "Allah calls Yusuf's story \"the best of stories\" (12:3). It moves from a dream to a well, a prison and a palace, and ends in forgiveness.",
    chapters: [
      {
        title: "The dream",
        body: "Yusuf saw eleven stars, the sun and the moon prostrating to him. His father Ya'qub warned him not to tell his brothers, and told him that Allah would choose him and teach him the interpretation of events.",
        refs: ["12:4-6"],
      },
      {
        title: "The well",
        body: "His brothers resented that their father loved Yusuf and his brother more. Some wanted to kill him, but one of them said, \"Do not kill Joseph but throw him into the bottom of the well.\" They left him there and returned with false blood on his shirt, and Allah inspired Yusuf that he would one day inform them of what they had done.",
        refs: ["12:8-18"],
      },
      {
        title: "Sold into Egypt",
        body: "Travellers drew him out of the well and sold him for a few dirhams. The man from Egypt who bought him told his wife to make his stay comfortable, saying perhaps they would adopt him as a son. When Yusuf reached maturity, Allah gave him judgement and knowledge.",
        refs: ["12:19-22"],
      },
      {
        title: "The test in the house",
        body: "The wife of his master closed the doors and sought to seduce him, but he said, \"the refuge of Allah.\" They raced to the door, and his shirt, torn from the back, showed his innocence. When the women of the city gossiped, she invited them, they cut their hands in amazement at him, and she threatened him with prison. Yusuf said, \"My Lord, prison is more to my liking than that to which they invite me.\"",
        refs: ["12:23-34"],
      },
      {
        title: "Prison",
        body: "In prison, Yusuf called two fellow prisoners to worship Allah alone before interpreting their dreams: one would serve wine to his master, the other would be crucified. He asked the one who would go free to mention him to his master, but Satan made him forget, and Yusuf remained in prison several years.",
        refs: ["12:36-42"],
      },
      {
        title: "The king's dream",
        body: "The king dreamt of seven fat cows eaten by seven lean ones, and seven green ears of grain and others dry. The freed prisoner remembered Yusuf, who explained it as seven years of plenty followed by seven of hardship, and told them to store the harvest in its ears. Before leaving prison, Yusuf asked that the case of the women be investigated, and the wife of al-'Azeez confessed, \"It was I who sought to seduce him.\"",
        refs: ["12:43-53"],
      },
      {
        title: "Over the storehouses",
        body: "The king took Yusuf into his service, and Yusuf asked, \"Appoint me over the storehouses of the land.\" When his brothers came seeking food, he recognised them but they did not recognise him, and he asked them to bring a brother of theirs from their father next time.",
        refs: ["12:54-61"],
      },
      {
        title: "I am Yusuf",
        body: "Yusuf kept his brother with him, and when the others returned in hardship, he asked, \"Do you know what you did with Joseph and his brother when you were ignorant?\" Then he revealed himself: \"I am Joseph, and this is my brother.\" When they admitted their sin, he said, \"No blame will there be upon you today. May Allah forgive you.\"",
        refs: ["12:69-92"],
      },
      {
        title: "The dream fulfilled",
        body: "His shirt restored his father's sight, and the whole family came to Egypt. Yusuf raised his parents upon the throne, and they bowed to him. He said, \"O my father, this is the explanation of my vision of before. My Lord has made it reality,\" and asked Allah to let him die in submission and join him with the righteous.",
        refs: ["12:93-101"],
      },
    ],
  },
  {
    slug: "ayyub",
    name: "Ayyub",
    intro: "Allah describes Ayyub as patient, \"an excellent servant,\" one who repeatedly turned back to Him (38:44).",
    chapters: [
      {
        title: "Adversity",
        body: "Ayyub was touched by hardship and torment. He called to his Lord, \"Indeed, adversity has touched me, and You are the most merciful of the merciful.\"",
        refs: ["21:83", "38:41"],
      },
      {
        title: "Relief",
        body: "Allah answered him and removed his affliction. He was told to strike the ground with his foot, and there was a cool spring to bathe in and drink. Allah gave him back his family and the like of them with them, as a mercy and a reminder for those who worship Him.",
        refs: ["21:84", "38:42-43"],
      },
      {
        title: "An excellent servant",
        body: "Allah told him to take a bunch of grass in his hand and strike with it, so that he would not break his oath. \"Indeed, We found him patient, an excellent servant. Indeed, he was one repeatedly turning back.\"",
        refs: ["38:44"],
      },
    ],
  },
  {
    slug: "shuayb",
    name: "Shu'ayb",
    intro: "Shu'ayb was sent to the people of Madyan, who cheated in measure and weight.",
    chapters: [
      {
        title: "Full measure",
        body: "Shu'ayb called Madyan to worship Allah alone, to give full measure and weight, and not to deprive people of their due or spread corruption. He told them, \"I only intend reform as much as I am able. And my success is not but through Allah.\"",
        refs: ["7:85", "11:84-88"],
      },
      {
        title: "Mockery",
        body: "They asked, \"does your prayer command you that we should leave what our fathers worship or not do with our wealth what we please?\" They called him weak and said that if not for his family they would have stoned him. He asked them, \"is my family more respected for power by you than Allah?\"",
        refs: ["11:87", "11:91-92"],
      },
      {
        title: "Threatened with exile",
        body: "The arrogant leaders threatened to evict Shu'ayb and the believers unless they returned to their religion. He refused, saying, \"Upon Allah we have relied. Our Lord, decide between us and our people in truth.\"",
        refs: ["7:88-89"],
      },
      {
        title: "The end of Madyan",
        body: "Allah saved Shu'ayb and those who believed with him, and the shriek seized those who had wronged, as if they had never lived there. The Qur'an also tells of Shu'ayb calling the companions of the thicket, who denied him and were seized by the punishment of the day of the black cloud.",
        refs: ["11:94-95", "7:91-92", "26:176-189"],
      },
    ],
  },
  {
    slug: "musa",
    name: "Musa",
    intro: "Musa was born under Pharaoh's oppression and raised in his palace, spoke with Allah, and led the Children of Israel out of Egypt.",
    chapters: [
      {
        title: "Cast into the river",
        body: "Pharaoh oppressed the Children of Israel, slaughtering their newborn sons. Allah inspired Musa's mother to nurse him and, when she feared for him, to cast him into the river. Pharaoh's family picked him up, and Pharaoh's wife said, \"Do not kill him.\" Allah kept every wet nurse from him, so his sister guided them to his own mother, and Allah returned him to her.",
        refs: ["28:4-13"],
      },
      {
        title: "Flight to Madyan",
        body: "As a man, Musa struck someone in a fight and the man died; he asked Allah's forgiveness and was forgiven. Warned that the leaders meant to kill him, he fled to Madyan, where he watered two women's flock and made his dua of need in the shade. He married one of their father's daughters and worked for him for the agreed term.",
        refs: ["28:14-29"],
      },
      {
        title: "The fire on the mountain",
        body: "Travelling with his family, Musa saw a fire and went to it, and was called: \"O Moses, indeed I am Allah, Lord of the worlds.\" His staff became a snake and his hand came out white, and he was sent to Pharaoh. Musa asked Allah to expand his chest, ease his task and give him his brother Harun as a helper, and was told, \"You have been granted your request, O Moses.\"",
        refs: ["28:29-35", "20:9-36"],
      },
      {
        title: "Before Pharaoh",
        body: "Musa and Harun were told to speak to Pharaoh with gentle speech and ask him to send the Children of Israel with them. Pharaoh called it magic and summoned his magicians on the day of the festival. Musa's staff swallowed what they had crafted, and the magicians fell down in prostration, saying, \"We have believed in the Lord of Aaron and Moses,\" holding firm even when Pharaoh threatened to crucify them.",
        refs: ["20:42-73"],
      },
      {
        title: "The sea",
        body: "Allah told Musa to travel by night with His servants. Pharaoh pursued them, and when Musa's companions cried, \"Indeed, we are to be overtaken!\" he said, \"No! Indeed, with me is my Lord; He will guide me.\" He struck the sea with his staff and it parted; Allah saved Musa and those with him and drowned the pursuers. As he drowned, Pharaoh declared belief, too late.",
        refs: ["26:52-66", "10:90-92"],
      },
      {
        title: "Speaking with his Lord",
        body: "Allah made an appointment with Musa of forty nights. When his Lord spoke to him, Musa asked to see Him. He was told to look at the mountain; when his Lord appeared to it, it was levelled, and Musa fell unconscious. When he awoke he said, \"Exalted are You! I have repented to You,\" and he was given the tablets, with guidance and mercy.",
        refs: ["7:142-145"],
      },
      {
        title: "The calf",
        body: "In Musa's absence, the Samiri made a calf with a lowing sound from the people's ornaments, and they worshipped it, though Harun warned them. Musa returned angry and grieved. When his anger subsided, he took up the tablets and prayed, \"My Lord, forgive me and my brother and admit us into Your mercy.\"",
        refs: ["7:148-154", "20:85-97"],
      },
      {
        title: "The cow",
        body: "When a man was killed and the people disputed over it, Allah commanded them to slaughter a cow. They answered with question after question about its age and colour, and in the end slaughtered her, \"but they could hardly do it.\" Striking the slain man with part of it brought out what they had been concealing.",
        refs: ["2:67-73"],
      },
      {
        title: "The forty years",
        body: "Musa told his people to enter the blessed land Allah had assigned them, but they refused out of fear, saying, \"go, you and your Lord, and fight. Indeed, we are remaining right here.\" It was forbidden to them for forty years, in which they wandered through the land.",
        refs: ["5:20-26"],
      },
      {
        title: "The journey to the two seas",
        body: "Musa travelled to the junction of the two seas to meet a servant of Allah who had been given knowledge from Him. He promised patience, but could not stay silent when the man damaged a ship, killed a boy and rebuilt a wall without payment. Before they parted, the servant explained: the ship was spared from a king who seized ships, the boy's believing parents were protected, and a treasure was kept for two orphans. \"And I did it not of my own accord.\"",
        refs: ["18:60-82"],
      },
    ],
  },
  {
    slug: "harun",
    name: "Harun",
    intro: "Harun, the brother of Musa, was given to him as a helper and a prophet at Musa's own request.",
    chapters: [
      {
        title: "A brother as a helper",
        body: "When Musa was sent to Pharaoh, he asked Allah for a minister from his family, \"Aaron, my brother,\" who was more fluent in speech. Allah granted it: \"We gave him out of Our mercy his brother Aaron as a prophet.\"",
        refs: ["20:29-36", "28:34-35", "19:53"],
      },
      {
        title: "Before Pharaoh",
        body: "Musa and Harun went to Pharaoh together, told to speak gently. When they were afraid, Allah said, \"Fear not. Indeed, I am with you both; I hear and I see.\" When the magicians believed, they declared faith in \"the Lord of Aaron and Moses.\"",
        refs: ["20:42-47", "20:70"],
      },
      {
        title: "Left in charge",
        body: "When Musa went to meet his Lord, he told Harun, \"Take my place among my people.\" While he was away, the people took the calf. Harun warned them, \"O my people, you are only being tested by it,\" but they refused to listen. When Musa returned and seized him, Harun explained that he had feared causing division among the Children of Israel, and Musa prayed for forgiveness for them both.",
        refs: ["7:142", "20:90-94", "7:150-151"],
      },
    ],
  },
  {
    slug: "dhul-kifl",
    name: "Dhul-Kifl",
    intro: "The Qur'an names Dhul-Kifl twice, among the patient and the outstanding. It does not describe the events of his life.",
    chapters: [
      {
        title: "Among the patient",
        body: "Allah mentions Dhul-Kifl with Isma'il and Idris: \"all were of the patient,\" and says He admitted them into His mercy, for they were of the righteous. Elsewhere He names him with Isma'il and Al-Yasa' as among the outstanding.",
        refs: ["21:85-86", "38:48"],
      },
    ],
  },
  {
    slug: "dawud",
    name: "Dawud",
    intro: "Dawud was a soldier who became a king and a prophet. Allah gave him the Zabur, and the mountains and the birds glorified Allah with him.",
    chapters: [
      {
        title: "Dawud and Jalut",
        body: "When Talut led the believers out against Jalut and his soldiers, many lost heart, but those who were certain of meeting Allah prayed, \"Our Lord, pour upon us patience and plant firmly our feet.\" They defeated them by permission of Allah, Dawud killed Jalut, and Allah gave him the kingship and wisdom.",
        refs: ["2:249-251"],
      },
      {
        title: "The mountains and the birds",
        body: "Allah commanded the mountains and the birds to repeat His praises with Dawud, exalting Him in the afternoon and after sunrise. Allah strengthened his kingdom and gave him the Zabur.",
        refs: ["34:10", "38:18-20", "17:55"],
      },
      {
        title: "Iron made soft",
        body: "Allah made iron pliable for Dawud and taught him to make coats of mail, measuring their links precisely, to protect people in battle. \"Work, O family of David, in gratitude.\"",
        refs: ["34:10-11", "21:80", "34:13"],
      },
      {
        title: "The two litigants",
        body: "Two men climbed over the wall of Dawud's prayer chamber and asked him to judge between them: one with ninety-nine ewes had demanded the other's only ewe. Dawud judged that he had been wronged, then became certain that he himself was being tried. He asked forgiveness of his Lord, fell down bowing and repented, and Allah forgave him and told him to judge between people in truth and not follow desire.",
        refs: ["38:21-26"],
      },
    ],
  },
  {
    slug: "sulayman",
    name: "Sulayman",
    intro: "Sulayman inherited from his father Dawud and was given a kingdom unlike any other, yet he kept asking to be grateful.",
    chapters: [
      {
        title: "A kingdom and knowledge",
        body: "Sulayman inherited from Dawud and said, \"O people, we have been taught the language of birds, and we have been given from all things.\" When he and his father judged a case over a field that sheep had grazed at night, Allah gave understanding of it to Sulayman.",
        refs: ["27:15-16", "21:78-79"],
      },
      {
        title: "The valley of the ants",
        body: "As Sulayman's soldiers of jinn, men and birds marched, an ant told the others to enter their dwellings so they would not be crushed. Sulayman smiled at her words and prayed, \"My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents.\"",
        refs: ["27:17-19"],
      },
      {
        title: "The hoopoe and the queen",
        body: "The hoopoe came from Sheba with news of a woman ruling a people who prostrated to the sun. Sulayman sent her a letter: \"In the name of Allah, the Entirely Merciful, the Especially Merciful.\" She sent him a gift, which he refused, saying, \"what Allah has given me is better than what He has given you.\"",
        refs: ["27:20-37"],
      },
      {
        title: "The throne",
        body: "One who had knowledge from the Scripture brought the queen's throne to Sulayman before his glance could return. Seeing it, he said, \"This is from the favor of my Lord to test me whether I will be grateful or ungrateful.\" When the queen came, she said, \"My Lord, indeed I have wronged myself, and I submit with Solomon to Allah, Lord of the worlds.\"",
        refs: ["27:38-44"],
      },
      {
        title: "The wind and the jinn",
        body: "Allah subjected the wind to Sulayman, and jinn who built and dived for him. He prayed, \"My Lord, forgive me and grant me a kingdom such as will not belong to anyone after me.\" Even his death was a sign: the jinn kept working, unaware he had died, until a creature of the earth ate his staff and he fell.",
        refs: ["34:12-14", "38:35-38", "21:81-82"],
      },
    ],
  },
  {
    slug: "ilyas",
    name: "Ilyas",
    intro: "Ilyas was one of the messengers, sent to a people who called upon the idol Ba'l.",
    chapters: [
      {
        title: "The best of creators",
        body: "Ilyas asked his people, \"Do you call upon Ba'l and leave the best of creators - Allah, your Lord and the Lord of your first forefathers?\" They denied him. Allah left for him an honoured mention among later generations, \"Peace upon Elias,\" and counted him among the righteous and His believing servants.",
        refs: ["37:123-132", "6:85"],
      },
    ],
  },
  {
    slug: "al-yasa",
    name: "Al-Yasa'",
    intro: "The Qur'an mentions Al-Yasa' twice, among those Allah preferred over the worlds. It does not narrate the events of his life.",
    chapters: [
      {
        title: "Among the outstanding",
        body: "Al-Yasa' is named with Isma'il, Yunus and Lut: \"all of them We preferred over the worlds.\" He is also named with Isma'il and Dhul-Kifl: \"all are among the outstanding.\"",
        refs: ["6:86", "38:48"],
      },
    ],
  },
  {
    slug: "yunus",
    name: "Yunus",
    intro: "Yunus, \"the man of the fish,\" left his people in anger and called on Allah from the darkness inside the fish.",
    chapters: [
      {
        title: "Leaving in anger",
        body: "Yunus went off in anger, thinking that Allah would not decree anything upon him, and ran away to a laden ship. When lots were drawn, he was among the losers.",
        refs: ["21:87", "37:139-141"],
      },
      {
        title: "In the darkness",
        body: "The fish swallowed him, and he called out within the darknesses, \"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.\" Had he not been of those who exalt Allah, he would have remained inside it until the Day of Resurrection.",
        refs: ["37:142-144", "21:87"],
      },
      {
        title: "The shore",
        body: "Allah responded to him and saved him from the distress. He was cast, ill, onto the open shore, and Allah caused a gourd vine to grow over him. His Lord chose him and made him of the righteous.",
        refs: ["21:88", "37:145-146", "68:49-50"],
      },
      {
        title: "A people who believed",
        body: "Yunus was sent to a hundred thousand or more, and they believed. The Qur'an singles out the people of Yunus as the one town whose belief benefited them, so the punishment of disgrace was lifted from them.",
        refs: ["37:147-148", "10:98"],
      },
    ],
  },
  {
    slug: "zakariyya",
    name: "Zakariyya",
    intro: "Zakariyya cared for Maryam and, in old age, asked Allah for an heir.",
    chapters: [
      {
        title: "The guardian of Maryam",
        body: "The wife of 'Imran dedicated her child to Allah; the child was Maryam, and Allah put her in the care of Zakariyya. Whenever he entered upon her in the prayer chamber he found provision with her, and she said, \"It is from Allah. Indeed, Allah provides for whom He wills without account.\"",
        refs: ["3:35-37"],
      },
      {
        title: "A private call",
        body: "Right there, Zakariyya called to his Lord in a private call. His bones had weakened, his hair was white and his wife was barren, but he said, \"never have I been in my supplication to You, my Lord, unhappy,\" and asked for an heir who would be pleasing to Allah.",
        refs: ["3:38", "19:3-6"],
      },
      {
        title: "Good tidings of Yahya",
        body: "The angels called to him while he stood in prayer with good tidings of a boy named Yahya, a name given to no one before. When he asked how, being old with a barren wife, he was told, \"It is easy for Me, for I created you before, while you were nothing.\" His sign was that he would not speak to people for three days except by gesture.",
        refs: ["3:39-41", "19:7-10"],
      },
      {
        title: "Hastening to good",
        body: "Allah responded to him, gave him Yahya and made his wife able to bear a child. \"Indeed, they used to hasten to good deeds and supplicate Us in hope and fear, and they were to Us humbly submissive.\"",
        refs: ["21:89-90"],
      },
    ],
  },
  {
    slug: "yahya",
    name: "Yahya",
    intro: "Yahya, son of Zakariyya, was born to parents in old age and given wisdom as a child.",
    chapters: [
      {
        title: "A name never given before",
        body: "Allah gave Zakariyya good tidings of a boy \"whose name will be John. We have not assigned to any before this name.\" He would confirm a word from Allah, and be honourable, chaste and a prophet from among the righteous.",
        refs: ["19:7", "3:39"],
      },
      {
        title: "Wisdom as a boy",
        body: "Yahya was told, \"O John, take the Scripture with determination,\" and was given judgement while still a boy, with affection and purity from Allah. He was fearing of Allah, dutiful to his parents, and not a disobedient tyrant.",
        refs: ["19:12-14"],
      },
      {
        title: "Peace upon him",
        body: "Allah says of him: \"And peace be upon him the day he was born and the day he dies and the day he is raised alive.\"",
        refs: ["19:15"],
      },
    ],
  },
  {
    slug: "isa",
    name: "'Isa",
    intro: "The Messiah, 'Isa son of Maryam, was a messenger to the Children of Israel, born by Allah's word without a father.",
    chapters: [
      {
        title: "Maryam",
        body: "The angels told Maryam that Allah had chosen her, purified her and chosen her above the women of the worlds. When the angel came to her in the form of a well-proportioned man with news of a pure son, she asked, \"How can I have a boy while no man has touched me?\" and was told, \"It is easy for Me.\"",
        refs: ["3:42-47", "19:16-21"],
      },
      {
        title: "Under the palm tree",
        body: "The pains of childbirth drove Maryam to the trunk of a palm tree. She was told, \"Do not grieve,\" that a stream had been provided beneath her, and to shake the palm so that fresh dates would fall. She was to keep a vow of silence.",
        refs: ["19:22-26"],
      },
      {
        title: "Speaking in the cradle",
        body: "When she brought him to her people, they reproached her. She pointed to the baby, and he spoke: \"Indeed, I am the servant of Allah. He has given me the Scripture and made me a prophet.\"",
        refs: ["19:27-33"],
      },
      {
        title: "Signs by Allah's permission",
        body: "'Isa was taught the Torah and the Gospel and sent to the Children of Israel. By Allah's permission he formed a bird from clay and breathed into it, healed the blind and the leper, and gave life to the dead. He told them, \"Indeed, Allah is my Lord and your Lord, so worship Him.\"",
        refs: ["3:48-51", "5:110"],
      },
      {
        title: "The disciples and the table",
        body: "He asked, \"Who are my supporters for Allah?\" and the disciples answered, \"We are supporters for Allah.\" They asked for a table spread with food from the heaven, and 'Isa prayed for it to be a festival for the first of them and the last of them, and a sign.",
        refs: ["3:52-53", "5:111-115"],
      },
      {
        title: "Raised to Allah",
        body: "His enemies claimed they had killed him, \"And they did not kill him, nor did they crucify him.\" Allah raised him to Himself. 'Isa had given good tidings of a messenger to come after him \"whose name is Ahmad.\"",
        refs: ["4:157-158", "61:6"],
      },
      {
        title: "His testimony",
        body: "On the Day of Judgement, Allah will ask 'Isa whether he told people to take him and his mother as gods. He will answer, \"It was not for me to say that to which I have no right,\" and, \"I said not to them except what You commanded me - to worship Allah, my Lord and your Lord.\"",
        refs: ["5:116-117"],
      },
    ],
  },
  {
    slug: "muhammad",
    name: "Muhammad",
    intro: "The Messenger of Allah and the seal of the prophets (33:40), sent \"as a mercy to the worlds\" (21:107). This story keeps to what the Qur'an itself says of his life.",
    chapters: [
      {
        title: "An orphan, sheltered",
        body: "Allah reminded His Messenger: \"Did He not find you an orphan and give refuge? And He found you lost and guided, And He found you poor and made self-sufficient.\"",
        refs: ["93:6-8"],
      },
      {
        title: "The revelation",
        body: "The Qur'an was brought down upon his heart by Jibril. Among its commands to him: \"Recite in the name of your Lord who created,\" and \"Arise and warn.\" He does not speak from his own inclination: \"It is not but a revelation revealed.\"",
        refs: ["2:97", "96:1-5", "74:1-2", "53:2-4"],
      },
      {
        title: "The Night Journey",
        body: "Allah took His servant by night from al-Masjid al-Haram to al-Masjid al-Aqsa, whose surroundings He had blessed, to show him of His signs. At the Lote Tree of the Utmost Boundary, \"He certainly saw of the greatest signs of his Lord.\"",
        refs: ["17:1", "53:13-18"],
      },
      {
        title: "The cave",
        body: "When the disbelievers drove him out, he was one of two in the cave, and he said to his companion, \"Do not grieve; indeed Allah is with us.\" Allah sent down His tranquility upon him and supported him with soldiers they did not see.",
        refs: ["9:40"],
      },
      {
        title: "Badr",
        body: "At Badr the believers were few and weak. They asked their Lord for help, and He reinforced them with angels, \"And victory is not but from Allah.\"",
        refs: ["3:123", "8:9-10"],
      },
      {
        title: "Under the tree",
        body: "The believers pledged allegiance to him under the tree, and Allah was pleased with them, sent down tranquility upon them and rewarded them with a conquest near at hand. Allah had shown His Messenger a true vision that they would enter al-Masjid al-Haram in safety.",
        refs: ["48:18", "48:27", "48:1"],
      },
      {
        title: "The religion completed",
        body: "Allah declared, \"This day I have perfected for you your religion and completed My favor upon you and have approved for you Islam as religion.\" When victory came and people entered the religion of Allah in multitudes, he was told to exalt his Lord with praise and ask His forgiveness.",
        refs: ["5:3", "110:1-3"],
      },
    ],
  },
];

export function getProphetStory(slug: string): ProphetStory | undefined {
  return PROPHET_STORIES.find((story) => story.slug === slug);
}

export function getStoryByProphetName(name: string): ProphetStory | undefined {
  return PROPHET_STORIES.find((story) => story.name === name);
}
