// ==UserScript==
// @name         Tone Marks II
// @namespace    http://tampermonkey.net/
// @version      2.0.8
// @description  Add tone marks on Ao3 works
// @author       irrationalpie7
// @match        https://archiveofourown.org/*
// clang-format off
// @updateURL    https://github.com/irrationalpie7/AO3-Tone-Marks/raw/main/Tone%20Marks%20II.pub.user.js
// @downloadURL  https://github.com/irrationalpie7/AO3-Tone-Marks/raw/main/Tone%20Marks%20II.pub.user.js
// @require      https://github.com/irrationalpie7/AO3-Tone-Marks/experimental-imports/main/mdzs.js
// clang-format on
// @grant        none
// ==/UserScript==

const {mdzsRules} = mdzs;

(function() {
'use strict';

function doTheThing() {
  // Check whether this page is an ao3 work.
  const works_regex = /https:\/\/archiveofourown\.org(\/.*)?\/works\/[0-9]+.*/;
  // Check whether it's an editing page.
  const edit_page_regex = /\/works\/[0-9]+\/edit/;

  if (window.location.href.match(works_regex) !== null) {
    if (window.location.href.match(edit_page_regex) === null &&
        !window.location.href.includes('works/new')) {
      console.log('On a works page, potentially making pinyin replacements...')
      // Don't make replacements on the new work/edit work (tag) page, that
      // sounds confusing.
      doReplacements(document.getElementById('main'));
    }
  } else {
    console.log(
        'Not on a works page; going to try to do pinyin replacement per blurb...')
    // Get all the work/series blurbs
    const blurbs = Array.from(document.querySelectorAll('.blurb'));
    for (let i = 0; i < blurbs.length; i++) {
      doReplacements(blurbs[i]);
    }
  }

  // Clean up re-replacements.
  const replacements = Array.from(document.querySelectorAll('.replacement'));
  replacements.forEach(function(span) {
    span.innerHTML = span.dataset.new;
  });
}
doTheThing();

/**
 * Replaces special html characters.
 * @param {string} str
 * @returns {string}
 */
function escaped(unsafe) {
  return (unsafe + '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll('\'', '&#039;');
}

/**
 * Returns a regex to match a sequence of words, allowing an optional
 * dash (-) or space ( ) between each word. The beginning and end of the
 * matching sequence must be at a word boundary.
 *
 * The regex will also match an incomplete html tag preceding the match, which
 * you can check for to avoid replacing within an html tag's attributes.
 *
 * @param {string[]} words
 * @return {RegExp}
 */
function wordsMatchRegex(words) {
  return new RegExp(
      '(<[a-z]+ [^>]*)?\\b(' +
          words
              .map(
                  word =>
                      escaped(word).replace(/([.?*+^$[\]\\(){}|])/g, '\\$1'))
              .join('( |-)?') +
          ')\\b',
      'gi');
}

/**
 * Wraps the replacement text in a span and returns the span as a string.
 *
 * The span will have class 'replacement' and attributes 'data-orig' with the
 * original match and 'data-new' with the replacement text.
 * @param {string} replacement The new text
 * @param {string} match The original text which is being replaced
 * @return {string}
 */
function replacementHtml(replacement, match) {
  return '<span class="replacement" data-orig="' + match + '" data-new="' +
      escaped(replacement) + '">' + escaped(replacement) + '</span>';
}

/**
 * Replaces all occurrences that match 'from' in main's innerHTML with a span
 * whose text is 'to'.
 *
 * @param {{innerHTML: string}} main
 * @param {RegExp} from
 * @param {string} to
 */
function replaceTextOnPage(main, from, to) {
  main.innerHTML = main.innerHTML.replace(from, (match) => {
    if (match.startsWith('<')) {
      // Skip matches occurring inside incomplete html tags. This avoids e.g.
      // replacing within the href for a work tag.
      return match;
    }
    return replacementHtml(to, match);
  });
}

/**
 * Checks whether 'fandom' (ignoring case) is a substring of any of the fandom
 * tags.
 *
 * @param {string} fandom
 * @param {Element[]} fandomTags
 * @returns {boolean}
 */
function hasFandom(fandom, fandomTags) {
  const fandomRegex = new RegExp(fandom, 'i');
  for (let i = 0; i < fandomTags.length; i++) {
    if (fandomTags[i].innerHTML.match(fandomRegex) !== null) {
      return true;
    }
  }
  return false;
}

/**
 * Replaces pinyin for all text in element, using the fandoms in the element's
 * work tags to decide which rules to use.
 *
 * @param {HTMLElement} element
 */
function doReplacements(element) {
  // Having a simplified element to pass to 'replaceAll' allows us to avoid
  // re-rendering the element every time its inner html gets updated.
  const simplifiedElement = {innerHTML: element.innerHTML};

  // Anything with a 'tag' class that's a descendant of something with a
  // 'fandom' or 'fandoms' class.
  const workFandoms =
      Array.from(element.querySelectorAll('.fandoms .tag,.fandom .tag'));
  if (hasFandom('Word of Honor|Faraway Wanderers|Qi Ye', workFandoms)) {
    replaceAll(wordOfHonorReplacements(), simplifiedElement);
  }
  if (hasFandom(mdzsRules.fandomRegex, workFandoms)) {
    replaceAll(mdzsRules.replacementString, simplifiedElement);
  }
  if (hasFandom('Guardian', workFandoms)) {
    replaceAll(guardianReplacements(), simplifiedElement);
  }
  if (hasFandom('Nirvana in Fire', workFandoms)) {
    replaceAll(nirvanaReplacements(), simplifiedElement);
  }
  if (hasFandom('King\'s Avatar|Quánzhí Gāoshǒu', workFandoms)) {
    replaceAll(kingsAvatarReplacements(), simplifiedElement);
  }
  if (hasFandom(
          'TGCF|Tiān Guān Cì Fú|Heaven Official\'s Blessing', workFandoms)) {
    replaceAll(tgcfReplacements(), simplifiedElement);
  }
  replaceAll(genericReplacements(), simplifiedElement);

  // Return now if it turns out we didn't make any changes.
  if (simplifiedElement.innerHTML === element.innerHTML) {
    console.log('No matching fandoms, or no text found that needed replacing.');
    return;
  }

  // Actually replace element's innerHTML.
  element.innerHTML = simplifiedElement.innerHTML;
}

/**
 * Turns a long replacements string into a list of match objects, where:
 *  - match.words is an array of strings that form the individual words to
 * match
 *  - match.replacement is the text to replace that sequence with
 *
 * @param {string} replacements
 * @returns {{words:string[],replacement:string}[]}
 */
function splitReplacements(replacements) {
  return replacements.split('\n')
      .map(function(line) {
        return line.trim();
      })
      .filter(function(line) {
        return line.length > 0 && !line.startsWith('#');
      })
      .map(function(line) {
        const match = line.split('|');
        return {
          words: match[0].split(' ').filter(match => match.length > 0),
          replacement: match[1].trim()
        };
      });
}

/**
 * Replaces all matches in element.innerHTML with their replacements, as encoded
 * in the rules string.
 *
 * @param {string} allReplacementsString
 * @param {{innerHTML: string}} element
 */
function replaceAll(allReplacementsString, element) {
  // Avoid updating element.innerHTML until the very end.
  const simplifiedElement = {innerHTML: element.innerHTML};
  const replacements = splitReplacements(allReplacementsString);
  replacements.forEach(function(rule) {
    replaceTextOnPage(
        simplifiedElement, wordsMatchRegex(rule.words), rule.replacement);
  });
  element.innerHTML = simplifiedElement.innerHTML;
}

// About the <fandom>Replacements functions:
//
// For each line 'some text here|fancy replacement', replaces all instances of
// 'some text here' in the doc with 'fancy replacement'.
// Notes:
//  * capitalization on the left side is ignored
//  * any spaces on the left side that are between words will matching things
//      with
//      (a) no space there (b) a dash there or (c) a space there. Examples:
//      - 'hanguang jun|Hánguāng-jūn' means any of 'hanguang jun',
//        'hanguangjun', or 'hanguang-jun' will be replaced with
//        'Hánguāng-jūn'
//      - 'wen ke xing|Wēn Kèxíng' means that all of 'Wen KeXing', 'Wen Ke
//        Xing', and 'wen kexing' will be replaced with 'Wēn Kèxíng'
//  * any spaces on the left or right that are before all words or after all
//      words will be ignored
//  * partial-word matches will be ignored (e.g., if 'lan' is part of 'plan'
//      or 'land' it will not be replaced; if 'lan sect' is part of 'plan sect'
//      it will not be replaced)
//  * lines with only spaces on them, or that start with #, will be ignored.

/**
 * Hard-coded generic pinyin replacement rules.
 */
function genericReplacements() {
  return `
      # titles
      da ren|dàren
      gui fei|gùifēi
      fu ren|fūren
      ## I *think* guniang is this --> 姑娘?
      gu niang|gūniang
      ## gongzi (公子, gōngzī)
      gong zi|gōngzī

      # sibling relations
      ## Eldest brother: 大哥
      da ge|dàgē
      ## Elder brother: 哥哥
      ge ge|gēge
      ge|gē
      ## Elder sister 姐姐
      jie jie|jiějie
      ## sect sister (elder) 师姐
      shi jie|shījiě
      jie|jiě
      ## Elder brother (more formal) 兄长
      xiong zhang|Xiōngzhǎng
      ## (name-)xiong (兄 Xiōng)
      xiong|xiōng

      # misc
      ## Jiāng Hú 江湖
      jiang hu|Jiānghú
      ## guqin ( Chinese: 古琴;  pinyin: gǔqín)
      gu qin|gǔqín
      `;
}

/**
 * Hard-coded Guardian pinyin replacement rules.
 */
function guardianReplacements() {
  return `
      # guardian
      ## Zhao Yunlan (赵云澜 / 趙云瀾, Zhào Yúnlán)
      Chief Zhao|Chief Zhào
      Zhao Yun Lan|Zhào Yúnlán
      Yunlan|Yúnlán
      ## in the past: Kunlan Kūnlún | 昆仑
      Kunlun|Kūnlún
      ## Shen Wei (沈巍	Shěn Wēi) or Xiao Wei Xiǎo Wēi 小巍
      Shen Wei|Shěn Wēi
      Professor Shen|Professor Shěn
      Hei Pao Shi|Hēi Páo Shǐ
      Xiao Wei|Xiǎo Wēi")
      ## Zhao Xinci (赵心慈	Zhào Xīncí)
      Zhao Xin Ci|Zhào Xīncí
      ## Guo Ying 郭英 Guō Yīng
      Guo Ying|Guō Yīng
      ## Guo Changcheng 郭长城 Guō Chángchéng
      Guo Chang Cheng|Guō Chángchéng
      ## Zhu Hong 祝红 Zhù hóng
      Zhu Hong|Zhù Hóng
      ## Da Qing 大庆 Dàqìng
      Da Qing|Dà Qìng
      ## Chu Shuzhi 楚恕之 Chǔ shù zhī
      Chu Shu Zhi|Chǔ Shùzhī
      ## Wang Zheng 汪徵 Wāng zhēng
      Wang Zheng|Wāng Zhēng
      ## Lin Jing 林静 Lín Jìng
      Lin Jing|Lín Jìng
      ## Sang Zan 桑赞 Sāng Zàn
      Sang Zan|Sāng Zàn
      ## Old Li 老李 lǎo Lǐ Old Lǐ
      Old Li|Old Lǐ
      Lao Li|Lǎo Lǐ
      ## Ye Zun 夜尊 Yè Zūn
      Ye Zun|Yè Zūn
      ## Zhu Jiu 烛九 Zhú jiǔ
      Zhu Jiu|Zhú jiǔ
      ## Ya Qing 鸦青 Yā Qīng
      Ya Qing|Yā Qīng
      ## Sha Ya 沙雅 Shā Yǎ
      Sha Ya|Shā Yǎ
      ## Wang Xiangyang 王向阳 Wáng Xiàngyáng
      Wang Xiang Yang|Wáng Xiàngyáng
      ## Li Qian 李茜 Lǐ Qiàn
      Li Qian|Lǐ Qiàn
      ## Cheng Xinyan 成心妍 Chéng Xīnyán
      Cheng Xin Yan|Chéng Xīnyán
      ## Ouyang Zhen 欧阳贞 Ōuyáng Zhēn
      Ou Yang Zhen|Ōuyáng Zhēn
      ## Professor Zhou 周教授 Zhōu-jiàoshòu
      Professor Zhou|Professor Zhōu
      Teacher Zhou|Teacher Zhōu
      Zhou Jiao Shou|Zhōu-jiàoshòu
      ## Wu Tian'en 吴天恩 Wú Tiān'ēn
      Wu Tian En|Wú Tiān'ēn
      ## Wu Xiaojun 吴晓君 Wú Xiǎojūn
      Wu Xiao Jun|Wú Xiǎojūn
      ## Fourth Uncle 四叔 Sì Shū
      si shu|Sì Shū
      ## Ying Chun 迎春 Yíng Chūn
      Ying Chun|Yíng Chūn
      ## Cong Bo 丛波 Cóng Bō
      Cong Bo|Cóng Bō
      ## Gao Jingfeng 高劲风 Gāo Jìngfēng
      Gao Jing Feng|Gāo Jìngfēng
      ## An Bai 安柏 Ān Bǎi
      An Bai|Ān Bǎi
      ## Ye Huo 野火 Yě Huǒ
      Ye Huo|Yě Huǒ
      ## Da Ji 大吉 Dà Jí
      Da Ji|Dà Jí
      ## Bai Suxia 白素霞 Bái Sùxiá
      Bai Su Xia|Bái Sùxiá
      ## Shen Xi 沈溪 Shěn Xī
      Shen Xi|Shěn Xī
      ## Zhang Shi 獐狮 Zhāng Shī
      Zhang Shi|Zhāng Shī
      ## Chu Nianzhi 楚念之 Chǔ Niànzhī
      Chu Nian Zhi|Chǔ Niànzhī
      ## Guo Changjiang 郭长江 Guō Chángjiāng
      Guo Chang Jiang|Guō Chángjiāng
      ## Guo Xiong 郭雄 Guō Xióng
      Guo Xiong|Guō Xióng

      # PLACES
      ## Dragon City (龙城 Lóng chéng)
      Long Cheng|Lóng Chéng
      Long City|Lóng City

      # TERMS
      ## Haixing 海星 Hǎixīng
      Hai Xing|Hǎixīng
      ## Dixing 地星(人) Dexīngrén
      Di Xing Ren|Dixīngrén
      Di Xing|Dixīng
      Ya Shou|Yàshòu
      ## Rebel Chieftain 贼酋 zéiqiú
      Zei Qiu|Zéiqiú
      ## Regent  摄政官 shèzhènggūan
      She Zheng Guan|Shèzhènggūan
      `;
}

/**
 * Hard-coded Nirvana in Fire pinyin replacement rules.
 */
function nirvanaReplacements() {
  return `
      # Mostly from: https://lunatique.dreamwidth.org/221558.html
      ## I (irrationalpie) changed some capitalization and spacing?
      ## But I was just guessing

      # Láng Yá Băng  琅琊榜
      lang ya bang|Láng Yá Băng

      # Part 1 - Main Cast (MCS, NH, JY, LC)
      ## Méi Cháng Sū 梅长苏
      mei chang su|Méi Chángsū
      chang su|Chángsū
      ## Sū Zhé 苏哲
      su zhe|Sū Zhé
      ## Lín Shū 林殊
      lin shu|Lín Shū
      ## xiăo-Shū 小殊
      xiao shu|xiăo-Shū
      ## Zōng zhŭ 宗主 (Chief)
      zong zhu|Zōngzhŭ
      ## Sū xiānsheng 苏先生 (Sir Su)
      su xian sheng|Sū xiānsheng
      sir su|Sir Sū
      su manor|Sū Manor
      ## Sū gēge 苏哥哥 (big brother)
      su gege|Sū gēge
      ## Mù Ní Huáng 穆霓凰
      ## Ní Huáng jiějie  霓凰姐姐 (big sister)
      mu ni huang|Mù Níhuáng
      ni huang|Níhuáng
      mu manor|Mù Manor
      ## Ní Huáng Jùn Zhŭ  霓凰郡主 (Princess/Duchess)
      ## idk if this title can go alone, but here's my attempt
      ## at capitalization
      Níhuáng jun zhu|Níhuáng jùnzhŭ
      jun zhu|Jùnzhŭ
      ## Xiāo Jĭng Yán 萧景琰
      xiao jing yan|Xiāo Jĭngyán
      jing yan|Jĭngyán
      ## Jìng wáng 靖王 (Prince Jing)
      jing wang|Jìng wáng
      prince jing|Prince Jìng
      jing manor|Jìng Manor
      ## Diàn xià 殿下 (your highness)
      dian xia|Diànxià
      ## Shŭi Niú 水牛 (water buffalo)
      shui niu|Shŭiniú

      # Lìn Chén 蔺晨 / Lìn Chén gēge 蔺晨哥哥 (big brother)
      lin chen ge ge|Lìn Chén gēge
      lin chen|Lìn Chén
      ## Shào Gé Zhŭ 少阁主(Young Master)
      ## ¯\_(ツ)_/¯ no idea on spacing/caps
      shao ge zhu|Shào Gézhŭ

      # Part 2 - Jiang Zuo Alliance (FL,LG,ZP,GY,TL,MiaoYin,Mr13,PhysYan)
      ## Jiāng Zuŏ Méng 江左盟 (Jiang Zuo Alliance)
      jiang zuo meng|Jiāngzuŏ Méng
      jiang zuo|Jiāngzuŏ
      ## Fēi Liú 飞流
      Fei Liu|Fēi Liú
      ## Lí Gāng 黎纲
      li gang|Lí Gāng
      ## Zhēn Píng 甄平
      zhen ping|Zhēn Píng
      ## Gōng Yŭ 宫羽 (I think I also heard her called guniang/姑娘?)
      gong yu|Gōng Yŭ
      gong gu niang|Gōng gūniang
      ## Wèi Zhēng 卫峥
      wei zheng|Wèi Zhēng
      ## Tóng Lù 童路
      tong lu|Tóng Lù
      ## Shísān xiānsheng 十三先生(Mr. Shisan)
      shi san xian sheng|Shísān xiānsheng
      ## Yàn dàifu  晏大夫(Physician Yan)
      yan daifu|Yàn dàifu

      # Part 3 - Households (MQ,LX,JinYang,NF,LZY,QM,TS,Foya,etc)
      ## Chìyàn Jūn 赤焰军 (Chìyàn army)
      chiyan jun|Chìyàn Jūn
      chiyan|Chìyàn
      ## Cháng Lín Jūn 长林军 (Cháng Lín army)
      changlin jun|Chánglín Jūn
      changlin|Chánglín

      # Mù Qīng  穆青 / Qīng-er 青儿
      mu qing|Mù Qīng
      qing er|Qīng-er
      ## General Lín Xiè 林燮 / fù shuài 父帅 (father-general)
      lin zie|Lín Xiè
      fu shuai|fùshuài
      ## Jìn Yáng 晋阳 (Grand Princess Jin Yang) (lin shu's mother)
      jin yang|Jìnyáng
      ## lin manor, lin family
      lin manor|Lín Manor
      lin family|Lín family
      ## Niè Fēng 聂锋 / Niè dage 聂大哥
      nie feng|Niè Fēng
      nie dage|Niè dàgē
      ## Niè Duó 聂铎
      nie duo|Niè Duó

      # Liè Zhàn Yīng 列战英
      lie zhan ying|Liè Zhànyīng
      zhan ying|Zhànyīng
      ## Qī Mĕng 戚猛
      qi meng|Qī Mĕng
      ## Xiāo Tíng Shēng 萧庭生
      xiao ting sheng|Xiāo Tíngshēng
      ting sheng|Tíngshēng
      ## Fóyá 佛牙
      fo ya|Fóyá

      # Part 4 - Royal Palace (dadperor, JYu,JH,CP,Jingmom,consorts)
      ## Liáng Royal Family
      ## Xiāo Xuǎn 萧选 / Bì Xià 陛下 (your majesty) aka dadperor
      xiao xuan|Xiāo Xuǎn
      bi xia|Bìxià
      ## Xiāo Jĭng Yŭ, 萧景禹 / Prince Qí 祁王 aka whalebro
      xiao jing yu|Xiāo Jĭngyŭ
      jing yu|Jĭngyŭ
      qi wang|Qí wáng
      prince qi|Prince Qí
      ## Xiāo Jĭng Huán萧景桓 / Prince Yù  誉王
      xiao jing huan|Xiāo Jĭnghuán
      jing huan|Jĭnghuán
      yu wang|Yù wáng
      prince yu|Prince Yù
      yu manor|Yù Manor
      ## Xiāo Jĭng Xuān 萧景宣 / Prince Xiàn / 太子 Tài Zĭ (crown prince)
      xiao jing xuan|Xiāo Jĭngxuān
      jing xuan|Jĭngxuān
      xian wang|Xiàn wáng
      prince xian|Prince Xiàn
      tai zi|Tàizĭ
      ## Jì wáng 纪王 (Prince Jì)
      ji wang|Jì wáng
      prince ji|Prince Jì
      ## Princess Jĭng Níng 景宁
      jing ning|Jĭngníng

      # Tàinăinai 太奶奶 (Great-grandmother)
      tai nai nai|Tàinăinai
      ## Jìng fēi 静妃 (Consort Jing)
      jing fei|Jìng fēi
      consort jing|Consort Jìng
      concubine jing|Concubine Jìng
      ## Lì Yáng 莅阳 (Grand Princess Liyang)
      li yang|Lìyáng
      ## Yán hòu 言后 (Empress Yan)
      ## (conflicts with Marquis Yán (Yán hóuyé 言侯爷), so move to the end)
      ### yan hou|Yán hòu
      ## Yuè gùi fēi 越贵妃 (Noble Consort Yue)
      yue gui fei|Yuè gùifēi
      consort yue|Consort Yuè
      concubine yue|Concubine Yuè
      ## Hùi fēi 惠妃 (Consort Hui)
      hui fei|Hùi fēi
      consort hui|Consort Hùi
      concubine hui|Concubine Hùi
      ## Chén fēi 陈妃 (Consort Chen) / Lín Yùeyáo 林乐瑶
      chen fei|Chén fēi
      consort chen|Consort Chén
      concubine chen|Concubine Chén
      lin yueyao|Lín Yùeyáo
      yueyao|Yùeyáo
      ## niáng niang 娘娘 (madam?)
      niang niang|niángniang

      # Part 5 - Palace adjacent & Nobles (MZ,GZ,SZ,CQ,JR,YJ,YQ,XY,XB,XQ,Zhuo fam)
      ## Méng Zhì 蒙挚/ Méng dàgē 蒙大哥
      meng zhi|Méng Zhì
      meng da ge|Méng dàgē
      ## 大统领 dàtǒnglǐng
      ## --> I *think* these are the chars/pinyin for Méng Zhì's title as commander?
      meng da tong ling|Méng dàtǒnglǐng
      ## Gāo Zhàn 高湛 / Gāo gōng-gong 高公公
      gao zhan|Gāo Zhàn
      gao gong gong|Gāo gōnggong
      ## Shĕn Zhūi 沈追 /Shĕn dà ren 沈大人 (minister Shen)
      shen zhui|Shĕn Zhūi
      shen da ren|Shĕn dàren
      ## Cài Quán 蔡荃 / Cài dà ren 蔡大人 (minister Cai)
      cai quan|Cài Quán
      cai da ren|Cài dàren

      # Nobles
      ## Yán Yù Jīn言豫津
      yan yu jin|Yán Yùjīn
      yu jin|Yùjīn

      # Marquis Yán Qùe 言阙- Yán hóuyé 言侯爷
      yan que|Yán Qùe
      yan hou ye|Yán hóuyé
      hou ye|hóuyé
      ## Xiāo Jǐng Ruì 萧景睿
      xiao jing rui|Xiāo Jǐngruì
      jing rui|Jǐngruì
      ## Marquis Xiè Yù 谢玉  / Níng Guó Hóu 宁国侯 (Marquis of Ning)
      xie yu|Xiè Yù
      ning guo hou|Níng guóhóu
      marquis of ning|Marquis of Níng
      xie manor|Xiè Manor
      ## Xiè Bì 谢弼
      xie bi|Xiè Bì
      ## Xiè Qí 谢绮
      xie qi|Xiè Qí
      ## Yŭ Wén Niàn 宇文念
      yu wen nian|Yŭwén Niàn
      ## Prince Yŭ Wén Xuān 宇文暄
      yu wen xuan|Yŭwén Xuān
      ## Yŭ Wén Lín 宇文霖
      yu wen lin|Yŭwén Lín

      # Tiān Quán Shān Zhuāng 天泉山庄 (Tian Quan Manor)
      tian quan shan zhuang|Tiān Quán Shānzhuāng
      tian quan|Tiān Quán
      ## Zhuó Dĭngfēng 卓鼎风
      zhuo ding feng|Zhuó Dĭngfēng
      ## Zhuó fū ren Madam Zhuó  卓夫人
      zhuo fu ren|Zhuó fūren
      madam zhuo|Madam Zhuó
      ## Zhuó Qīng Yáo 卓青遥
      zhuo qing yao|Zhuó Qīngyáo

      # Part 6 - Others (XJ,XD,XC,XQ,Banruo,Hua ladies, Locations)
      # Xuán Jìng Sī 悬镜司 (Xuan Jing Bureau)
      xuan jing si|Xuánjìng Sī
      xuan jing|Xuánjìng
      ## Xià Jiāng 夏江
      xia jiang|Xià Jiāng
      ## Xià Dōng 夏冬/Dōng jiě 冬姐
      xia dong|Xià Dōng
      dong jie|Dōng jiě
      ## Xià Chūn 夏春
      xia chun|Xià Chūn
      ## Xià Qiū 夏秋
      xia qiu|Xià Qiū
      ## Bonus: The Legend of XiaXia
      xia xia|Xià Xià

      # the Huá
      ## Huá Zú 滑族 (Zú is race/nationality)
      hua zu|Huá Zú
      hua|Huá
      ## Qín Bān Ruò 秦般若
      qin ban ruo|Qín Bānruò
      ban ruo|Bānruò
      ## Sì Jiĕ 四姐 (4th sister) /  Jùn Niáng 隽娘
      si jie|Sì Jiĕ
      jun niang|Jùn Niáng
      ## Princess Xuán Jī 璇玑公主 (Xuánjī gōngzhǔ)
      princess xuan ji|Princess Xuánjī
      xuan ji gong zhu|Xuánjī gōngzhǔ
      xuan ji|Xuánjī
      ## Princess Líng Lóng 玲珑公主
      princess ling long|Princess Línglóng
      ling long gong zhu|Línglóng gōngzhǔ
      ling long|Línglóng
      gong zhu|Gōngzhǔ

      # Locations:
      ## Méi Lĭng 梅岭 / Mei Cliff
      mei ling|Méilĭng
      ## Láng Yá Gé 琅琊阁(Lang Ya Hall) / Láng Yá Shān 琅琊山 (Lang ya Mountain)
      lang ya ge|Lángyá Gé
      lang ya shan|Lángyá Shān
      lang ya|Lángyá
      ## Láng Zhōu
      lang zhou|Láng Zhōu
      ## Dà Liáng 大梁
      da liang|Dà Liáng
      ## Jīn Líng 金陵
      jin ling|Jīnlíng
      ## Xuĕ Lú 雪庐
      xue lu|Xuĕ Lú
      ## Miào Yīn Fáng 妙音坊 (Miao Yin Court)
      miao yin fang|Miàoyīn Fáng
      miao yin|Miàoyīn
      ## Hóng Xiù Zhāo  红袖招
      hong xiu zhao|Hóng Xiù Zhāo
      ## Luó Shì Jiē 螺市街 (Luóshì street)
      luo shi jie|Luóshì Jiē
      luo shi|Luóshì
      ## Zhĭ Luó Gōng 芷萝宫 (zhiluo palace)
      zhi luo gong|Zhĭluó Gōng
      zhi luo palace|Zhĭluó Palace
      ## Jiǔān Shān 九安山 (Jiǔān mountain--where the hunting palace was)
      jiu an shan|Jiǔān Shān
      jiu an|Jiǔān
      ## Yào Wáng Gǔ 药王谷 (Yàowáng Valley)
      yao wang gu|Yàowáng Gǔ
      yao wang valley|Yàowáng Valley
      ## Yún Nán 云南 (province mu nihuang is from)
      yun nan|Yúnnán
      ## Dōng Hăi 东海 (East China Sea?)
      dong hai|Dōng Hăi
      ## Nán Chŭ 南楚 / Southern Chŭ (country that borders yunnan)
      nan chu|Nán Chŭ
      southern chu|Southern Chŭ
      ## Dà Yú 大渝
      da yu|Dà Yú
      ## Bĕi Yàn 北燕
      bei yan|Bĕi Yàn
      ## Yè Qín
      ye quin|Yè Qín
      ## Jiāng Hú 江湖
      jiang hu|Jiānghú

      # A few misc partial names and titles to try to catch partial matches
      ## Lín Shū 林殊 / Lìn Chén 蔺晨
      lin|[Lín (Shū) or Lìn (Chén)]
      shu|Shū
      chen|Chén
      ## Méi Cháng Sū 梅长苏
      mei|Méi
      ## Cài Quán 蔡荃 / Cài dà ren 蔡大人 (minister Cai)
      da ren|dàren
      ## Gāo Zhàn 高湛 / Gāo gōng-gong 高公公
      gong gong|gōnggong
      ## Yuè gùi fēi 越贵妃 (Noble Consort Yue)
      gui fei|gùifēi
      ## Fēi Liú 飞流 and consort (妃) are both "fēi" so we cheat a little here
      fei|Fēi
      ## Zhuó fū ren Madam Zhuó  卓夫人
      fu ren|fūren
      ## I *think* guniang is this --> 姑娘?
      gu niang|gūniang
      ## sibling relations
      da ge|dàgē
      ge ge|gēge
      ge|gē
      jie jie|jiějie
      jie|jiě

      # Conflicts:
      ## Yán hòu 言后 (Empress Yan)
      ## (conflicts with Marquis Yán (Yán hóuyé 言侯爷), so move to the end)
      yan hou|Yán hòu
      `;
}

/**
 * Hard-coded Word of Honor pinyin replacement rules.
 */
function wordOfHonorReplacements() {
  return `
      # Mostly from: https://lunatique.dreamwidth.org/221218.html
      ## I (irrationalpie) changed some capitalization and spacing?
      ## But I was just guessing

      # Shan He Ling Pronunciation Guide
      # MAIN CAST
      ## 周子舒 Zhōu Zǐshū
      zzs|Zhōu Zǐshū
      zhou zi shu|Zhōu Zǐshū
      zi shu|Zǐshū
      ## 周絮 Zhōu Xù
      zhou xu|Zhōu Xù
      zx|Zhōu Xù
      ## 阿絮 āh-Xù
      ah xu|āh-Xù
      a xu|āh-Xù
      ## 天窗首领  Tiān Chuāng shŏu lĭng | Leader of Window of Heaven
      tian chuang|Tiān Chuāng
      shou ling|shŏulĭng
      ## 庄主 Zhuāng zhŭ (manor host/owner/master)
      zhuang zhu|Zhuāngzhŭ
      ## 痨病鬼 láo bìng gŭi (by Ah Xiang)
      lao bing gui|láo bìng gŭi

      # 温客行 Wēn Kèxíng (1:10)
      wen ke xing|Wēn Kèxíng
      wkx|Wēn Kèxíng
      ke xing|Kèxíng
      ## 老温 lǎo Wēn (by ZZS)
      lao wen|lǎo Wēn
      ## 主人 zhǔrén | Master (by ah-Xiang)
      zhu ren|zhǔrén
      ## 谷主 gǔzhǔ | valley master (by all Ghosts)
      gu zhu|gǔzhǔ
      ## 甄衍 Zhēn Yăn (WKX’s childhood name)
      zhen yan|Zhēn Yăn
      ## 温叔 Wēn shū | Uncle Wen (by Chengling)
      wen shu|Wēn shū
      ## 阿行 āh-xíng （by Auntie Luo)
      ah xing|āh-xíng
      a xing|āh-xíng

      # 顾湘 Gù Xiāng (2:22)
      gu xiang|Gù Xiāng
      gx|Gù Xiāng
      ## 阿絮 āh-Xiāng
      ah xiang|āh-Xiāng
      a xiang|āh-Xiāng
      ## 丫头 yā tou (by WZX)
      ya tou|yātou
      ## 无心紫煞 Wú Xīn Zǐ Shà (Heartless Purple Fiend)
      wu xin zi sha|Wú Xīn Zǐ Shà
      ## 顾姑娘 Gù gūniàng (miss Gu)
      gu guniang|Gù gūniàng

      # 张成岭 Zhāng Chénglǐng (3:10)
      zhang cheng ling|Zhāng Chénglǐng
      cheng ling|Chénglǐng
      zcl|Zhāng Chénglǐng
      ## 金豆侠 jīn dòu xiá (by Ah Xiang)
      jin dou xia|jīn dòu xiá

      # 曹蔚宁 Cáo Wèiníng (3:30)
      cao wei ning|Cáo Wèiníng
      cwn|Cáo Wèiníng
      wn|Wèiníng
      ## 曹大哥 Cáo dà gē (by Ah Xiang)
      cao da ge|Cáo dàgē
      ## 傻瓜 shă guā (by Ah Xiang)
      sha gua|shăguā
      ## 清风山 Qīngfēng Shān (Qing Feng Sword Sect
      # 清风剑 Qīng Fēng Jiàn Sect
      qing feng shan|Qīngfēng Shān
      qing feng jian|Qīngfēng Jiàn
      qing feng|Qīngfēng
      ## 莫怀阳 Mò Huáiyáng
      mo huai yang|Mò Huáiyáng

      # 叶白衣 Yè Báiyī (3:57)
      ye bai yi|Yè Báiyī
      bai yi|Báiyī
      yby|Yè Báiyī
      ## 长明剑仙 Cháng Míng Jiàn Xiān (~changming sword immortal)
      chang ming jian xian|Chángmíng Jiàn Xiān
      chang ming|Chángmíng
      ## 叶前辈 Yè qiánbèi
      ye qian bei|Yè qiánbèi

      # WINDOW OF HEAVEN (4:35)
      ## 天窗 Tiān Chuāng
      tian chuang|Tiān Chuāng
      ## 晋王 Jìn wáng (Prince Jin)
      jin wang|Jìn wáng
      prince jin|Prince Jìn
      ## Helian Yi (赫连翊, Hèlián Yì)
      he lian yi|Hèlián Yì
      ## 韩英 Hán Yīng
      han ying|Hán Yīng
      hy|Hán Yīng
      ## Duàn Pengju (段鵬舉 Duàn Péngjǔ)
      duan peng ju|Duàn Péngjǔ

      # FOUR SEASONS MANOR (5:00)
      ## 四季山庄 Sì jì shān zhuāng (~four seasons + mountain villa)
      si ji shan zhuang|Sìjì Shānzhuāng
      si ji|Sìjì
      shan zhuang|Shānzhuāng
      ## 秦怀章 Qín Huáizhāng (ZZS’s master)
      qin huai zhang|Qín Huáizhāng
      ## 秦九霄 Qin Jiuxiao (ZZS’s shidi) (九霄 jiǔxiāo?)
      ## aka 梁九霄 - Liáng Jiǔxiāo in the novel
      qin jiuxiao|Qín Jiǔxiāo
      liang jiuxiao|Liáng Jiǔxiāo
      jiuxiao|Jiǔxiāo

      # 温如玉 Wēn Rúyù (WKX’s father)
      wen ru yu|Wēn Rúyù
      ## 谷妙妙 Gu Miaomiao (WKX’s mother) Gǔ Miàomiào
      gu miao miao|Gǔ Miàomiào

      # GHOST VALLEY (6:10)
      ## 鬼谷 Gŭi gŭ
      gui gu|Gŭigŭ
      ## 青崖山 Qīngyá shān (mount qingya)
      qing ya shan|Qīngyá shān
      qing ya|Qīngyá

      # 罗浮梦 Luó Fúmèng
      luo fu meng|Luó Fúmèng
      ## 喜丧鬼 Xǐ Sāng Guǐ (Tragicomic Ghost)
      xi sang gui|Xǐsāng Guǐ
      ## 薄情簿主 Bó Qíng Bù Zhŭ
      bo qing bu zhu|Bóqíng Bù Zhŭ
      ## 罗姨 Luó yí (Aunt Luó)
      luo yi|Luó yí

      # 柳千巧 Liǔ Qiānqiǎo
      liu qian qiao|Liǔ Qiānqiǎo
      ## 千巧姐 Qiānqiăo-jiĕ (by Ah Xiang)
      qian qiao jie|Qiānqiǎo jiĕ
      ## 艳鬼 Yàn Guǐ (Beauty Ghost)
      yan gui|Yàn Guǐ

      # SCORPIONS (7:43)
      ## 毒蝎 Dú Xiē
      du xie|Dú Xiē
      ## 蝎王 Xiē Wáng (Scorpion King)
      xie wang|Xiē Wáng
      ## 蝎儿 Xiē'ér
      xie er|Xiē'ér
      xie'er|Xiē'ér

      # 毒菩萨 Dú Pú Sà (Evil Bodhisattva)
      du pu sa|Dú Púsà
      ## 俏罗汉 Qiào luóhàn (Pretty Arhat)
      qiao luo han|Qiào luóhàn
      ## 秦松 Qín Sōng 魅曲 Mèiqǔ (phantom musician)
      qin song|Qín Sōng
      mei qu|Mèiqǔ
      ## 金毛蒋怪 Jīnmáo Jiăngguài (Blond Monster Jiang)
      jin mao jiang guai|Jīnmáo Jiăngguài

      # FIVE LAKE ALLIANCE (8:55)
      ## 五湖盟 Wǔhú Méng
      wu hu meng|Wǔhú Méng

      # 容炫 Róng Xuàn
      rong xuan|Róng Xuàn
      ## 岳风儿 Yuè Fēng'ĕr
      yue feng er|Yuè Fēng'ĕr
      yue feng'er|Yuè Fēng'ĕr
      yue feng|Yuè Fēng

      # Yuè Yáng Sect
      ## 高崇Gāo Chóng
      gao chong|Gāo Chóng
      ## 岳阳派 Yuè Yáng Sect
      yue yang|Yuèyáng
      ## 高盟主 Gāo méng zhŭ
      gao meng zhu|Gāo méngzhŭ
      ## 大哥 Da ge
      gao da ge|Gāo dàgē
      ## 高小怜 Gāo Xiǎolián (Daughter of Gao Chong)
      gao xiao lian|Gāo Xiǎolián
      ## 小怜姐 xiǎo lián jie
      xiao lian jie|Xiǎolián jiĕ
      xiaolian|Xiǎolián
      ## 邓宽 Dèng Kuān (Head Disciple Yue Yang Sect)
      deng kuan|Dèng Kuān

      # 赵敬 Zhào Jìng
      zhao jing|Zhào Jìng
      ## 太湖派  Tài Hú Sect
      tai hu|Tài Hú
      ## 赵盟主 Zhào méng zhŭ (Sect Leader Zhao)
      zhao meng zhu|Zhào méngzhŭ
      ## 赵玄德 Zhào Xuándé
      zhao xuan de|Zhào Xuándé
      ## 义夫 Yì fù (by Xie’er)
      yi fu|Yì fù

      # 沈慎 Shen Shen
      shen shen|Shěn Shèn
      ## 大孤山派 Da Gu Shan Sect
      da gu shan|Dà Gū Shān
      ## 沈掌门 Shen zhang men
      shen zhang men|Shěn zhǎngmén
      ## (五弟 wu di -> 5th brother)
      wu di|wǔdì

      # 张玉森 Zhāng Yùsēn (Cheng Ling’s father)
      zhang yu sen|Zhāng Yùsēn
      ## 镜湖派 Jìng Hú Mountain Pavilion
      jing hu|Jìng Hú

      # 陆太冲 Lù Tàichōng (Sect Leader of Dan Yang Sect)
      lu tai chong|Lù Tàichōng


      # OTHER SECTS/ JIANG HU PPL (11:47)
      ## 华山 Huáshān Sect
      hua shan|Huáshān
      ## 于丘烽 Yú Qiūfēng
      yu qiu feng|Yú Qiūfēng
      ## 烽郎 Fēng-láng (by Liu Qianqao)
      feng lang|Fēng láng

      # 安吉四贤 Ānjí sì xián (sages of anji??)
      ## names?
      an ji si xian|Ānjí sì xián

      # 隆源阁 Lóngyuán gé
      long yuan ge|Lóngyuán gé
      long yuan|Lóngyuán
      ## 龙雀 Lóng Què
      long que|Lóng Què
      ## 龙孝 Lóng Xiào
      long xiao|Lóng Xiào

      # 泰山派 Tàishān Sect
      tai shan|Tàishān
      ## 傲峡子 Aò Lái Zĭ
      ao lai zi|Aò Lái Zĭ

      # 桃红 Táo Hóng
      tao hong|Táo Hóng
      ## 绿柳 Lü4 Liŭ (Lǜ)
      lü liu|Lǜ Liŭ
      lu liu|Lǜ Liŭ
      lv liu|Lǜ Liŭ

      # OTHER TERMS (14:05)
      ## 山河岭 Shān Hé Lìng
      shan he ling|Shān Hé Lìng
      ## 知己 zhī jĭ (Soulmate)
      zhi ji|zhījĭ
      ## 琉璃甲 Liú Lí Jiă
      liu li jia|Liúlí Jiă
      liu li|Liúlí
      ## 孟婆汤 Mèng Pó Tāng (Waters of Lethe)
      meng po tang|Mèng Pó Tāng
      meng po|Mèng Pó
      ## 醉生梦死 Zùi Shēng Mèng Sĭ (Drunk Like a Dream)
      zui sheng meng si|Zùi Shēng Mèng Sĭ

      # SECT TERMS (15:03)
      ## 师父 shī fù (master)
      shi fu|shīfù
      ## 师叔 shī shū (uncle)
      shi shu|shīshū
      ## 师娘 shī niáng (“mother”, wife of shifu)
      shi niang|shīniáng
      ## 师兄 shī xiōng (older brother)
      shi xiong|shīxiōng
      ## 师弟 shī dì (younger brother)
      shi di|shīdì
      ## 师姐 shī jiĕ (older sister)
      shi jie|shījiĕ
      ## 师妹 shī mèi (younger sister)
      shi mei|shīmèi
      ## 师侄 shī zhí (nephew)
      shi zhi|shīzhí

      # 徒弟 tú dì (disciple)
      tu di|túdì

      # Extra
      ##  天涯客 | Faraway Wanderers - priest, 七爷 | Qi Ye - priest
      tian ya ke|Tiān Yá Kè
      qi ye|Qī Yé
      ## 景北渊, Jǐng Běiyuān
      jing bei yuan|Jǐng Běiyuān
      bei yuan|Běiyuān
      ## 与溪, Wǔ Xī is the Great Shaman of Nanjiang (南疆, Nán Jiāng)
      wu xi|Wǔ Xī
      nan jiang|Nánjiāng
      `;
}

/**
 * Hard-coded King's Avatar pinyin replacement rules.
 */
function kingsAvatarReplacements() {
  return `
      # King's avatar
      ## based mostly off [oakleaf's guide](https://oakleaffic.dreamwidth.org/1363.html)

      # Human Characters, with:
      ## - Character Name
      ## - Team(s) they’ve played for,
      ## - Class(es) they’ve played,
      ## - Major Avatar’s they’ve played,
      ## - Pinyin (for easier tags)
      ## - Hanzi

      # A
      ## An Wenyi (Tyrannical Ambition, Happy, Cleric, Little Cold Hands) - Ān Wényì, 安文逸
      An Wenyi|Ān Wényì

      # B
      ## Bai Yanfei (Tyranny, Elementalist, Rota) - Bái Yánfēi
      Bai Yanfei|Bái Yánfēi
      ## ?
      bai shu|Bái Shù
      ## Bao Rongxing (Happy, Brawler, Steamed Bun Invasion) - Bāo Róngxìng, 包荣兴
      Bao Rongxing|Bāo Róngxìng
      ## Bound Boat (Blue Brook Guild, Cleric, Bound Boat) - Xì Zhōu | Bound Boat, 系舟
      xi zhou|Xì Zhōu

      # C
      ## Chang Xian (Esports Reporter) Cháng Xiān
      Chang Xian|Cháng Xiān
      ## Chen Guo (Happy (Boss), Launcher, Chasing Haze) - Chén Guǒ, 陈果
      Chen Guo|Chén Guǒ
      ## Chen Yehui (Excellent Dynasty, Battle Mage) - Chén Yèhuī, 陈夜辉
      Chen Yehui|Chén Yèhuī
      ## Chu Yunxiu (Misty Rain, Chinese Glory Team, Elementalist, Windy Rain) Chǔ Yúnxiù, 楚云秀
      Chu Yunxiu|Chǔ Yúnxiù
      ## Cold Night (Tyrannical Ambition, Knight, Cold Night) Yè Dù Hán Tán | Cold Night, 夜度寒潭
      ye du han tan|Yè Dù Hán Tán
      ## Cui Li (Excellent Era, Club Manager) Cuī Lì
      Cui Li|Cuī Lì

      # D
      ## Dai Yanqi (Thunderclap, Elementalist, Firebird Messenger) Dài Yánqí, 戴妍琦
      Dai Yanqi|Dài Yánqí
      ## Deng Fusheng (Tiny Herb, Knight, Angelica) Dèng Fùshēng, 邓复升
      Deng Fusheng|Dèng Fùshēng
      ## Du Ming (Samsara, Blade Master, Moon-Luring Frost) - Dù Míng, 杜明
      Du Ming|Dù Míng

      # F
      ## Fang Minghua (Samsara, Cleric, Laughing Song) - Fāng Mínghuá
      Fang Minghua|Fāng Mínghuá
      ## Fang Rui (Wind Howl, Happy, Chinese Glory Team, Brawler, Thief, Qi Master, Doubtful Demon Boundless Sea) Fāng Ruì, 方锐
      Fang Rui|Fāng Ruì
      ## Fang Shijing (Blue Rain, Warlock, Swoksaar) - Fāng Shìjìng, 方世镜
      Fang Shijing|Fāng Shìjìng
      ## Fang Shiqian (Tiny Herb, Cleric, Paladin, Wind Guard, Aweto) - Fāng Shìqiān, 方士谦
      Fang Shiqian|Fāng Shìqiān
      ## Fang Xuecai (Thunderclap, Assassin, Demon Talent) Fāng Xuécái, 方学才
      Fang Xuecai|Fāng Xuécái

      # G
      ## Gao Yingjie (Tiny Herb, Witch, Kind Tree) - Gāo Yīngjié, 高英杰
      Gao Yingjie|Gāo Yīngjié
      yingjie|Yīngjié
      ## Gu Xiye (Heavenly Swords, Grappler, Night Tade) - Gù Xīyè
      Gu Xiye|Gù Xīyè
      ## Guan Rongfei (Excellent Era, Happy, (Technical Department)) Guān Róngfēi, 关榕飞
      Guan Rongfei|Guān Róngfēi
      ## Guo Mingyu (Royal Style, Exorcist, Peaceful Hermit) Guō Míngyǔ
      Guo Mingyu|Guō Míngyǔ
      ## Guo Shao (Miracle, Launcher, Berserker) Guō Shǎo
      Guo Shao|Guō Shǎo

      # H
      ## Han Wenqing (Tyranny, Striker, Desert Dust) - Hán Wénqīng, 韩文清
      Han Wenqing|Hán Wénqīng
      wenqing|Wénqīng
      ## Huang Shaotian (Blue Rain, Chinese Glory Team, Blade Master, Troubling Rain) - Huáng Shàotiān, 黄少天
      Huang Shaotian|Huáng Shàotiān
      Shaotian|Shàotiān

      # J
      ## Jia Shiming (Tyranny, Royal Style, Void, Striker) Jiǎ Shìmíng, 贾世明
      Jia Shiming|Jiǎ Shìmíng
      ## Jiang Botao (Parade, Samsara Spellblade, Empty Waves) - Jiāng Bōtāo, 江波涛
      Jiang Botao|Jiāng Bōtāo

      # L
      ## Liang Yichun (Blue Brook Guild, Berserker, Changing Spring) - Liáng Yìchūn, 梁易春
      Liang Yichun|Liáng Yìchūn
      ## Li Hua (Misty Rain, Ninja, Dark Forest) - Lǐ Huá, 李华
      Li Hua|Lǐ Huá
      ## Li Xuan (Void, Chinese Glory Team, Ghostblade, Crying Devil) - Lǐ Xuān, 李轩
      Li Xuan|Lǐ Xuān
      ## Li Xun (Void, Assassin, Ghost Lantern) Lǐ Xùn, 李迅
      Li Xun|Lǐ Xùn
      ## Li Yihui (Tiny Herb, Grappler, Flying Drops, Moving Mountain) Lǐ Yìhuī, 李亦辉
      Li Yihui|Lǐ Yìhuī
      ## Li Yuan (Blue Rain, Summoner, Eight Notes) - Lǐ Yuǎn, 李远
      Li Yuan|Lǐ Yuǎn
      ## Lin Jie (Tiny Herb, Witch, Vaccaria) Lín Jié, 林杰
      Lin Jie|Lín Jié
      ## Lin Jingyan (Wind Howl, Tyranny, Brawler, Demon Subduer, Dark Thunder) - Lín Jìngyán, 林敬言
      Lin Jingyan|Lín Jìngyán
      ## Liu Fei (Tiny Herb, Sharpshooter, Red Leaves) Liǔ Fēi (Quánzhí Gāoshǒu), 柳非
      Liu Fei|Liǔ Fēi
      quanzhi gaoshou|Quánzhí Gāoshǒu
      ## Liu Hao (Excellent Era, Thunderclap, Wind Howl, Spellblade, Total Darkness) Liú Hào, 刘皓
      Liu Hao|Liú Hào
      ## Liu Xiaobie (Tiny Herb, Blade Master, Flying Sword) - Liú Xiǎobié, 刘小别
      Liu Xiaobie|Liú Xiǎobié
      ## Lou Guanning (Heavenly Sword, Berserker, Loulan Slash) Lóu Guānníng, 楼冠宁
      Lou Guanning|Lóu Guānníng
      ## Lu Boyuan (Samsara, Grappler, Chaotic Cloudy Mountains) - Lǚ Bóyuǎn, (Lǚ Pōyuǎn) 吕泊远
      Lu Boyuan|Lǚ Bóyuǎn
      Lv Boyuan|Lǚ Bóyuǎn
      Lü Boyuan|Lǚ Bóyuǎn
      ## Lu Hanwen (Blue Rain, Blade Master, Flowing Cloud) - Lú Hànwén, 卢瀚文
      Lu Hanwen|Lú Hànwén
      ## Lu Liang/Lv Liang (Royal Style, Exorcist, Peaceful Hermit) - Lǚ Liáng
      Lu Liang|Lǚ Liáng
      Lv Liang|Lǚ Liáng
      Lü Liang|Lǚ Liáng
      ## Lu Yining (Misty Rain, Thunderclap, Sharpshooter, Something to Hide) - Lǔ Yìníng
      Lu Yining|Lǔ Yìníng
      ## Luo Ji (Happy, Summoner, Concealed Light) Luō Jí, 罗辑
      Luo Ji|Luō Jí

      # M
      ## Mo Fan (Happy, Ninja, Assassin, Deception) - Mò Fán, 莫凡
      Mo Fan|Mò Fán

      # P
      ## Plantago Seed (Herb Garden, Witch, Plantago Seed) - Chē Qiánzǐ | Plantago Seed, 车前子
      che qianzi|Chē Qiánzǐ

      # Q
      ## Qiao Yifan (Tiny Herb, Happy, Assassin, Ghostblade, One Inch Ash) - Qiáo Yīfān, 喬一帆
      Qiao Yifan|Qiáo Yīfān
      yifan|Yīfān
      ## Qin Muyun (Tyranny, Sharpshooter, Negative Nine Degrees) - Qín Mùyún
      Qin Muyun|Qín Mùyún
      ## Qin Tianran (Excellent Era, Elementalist, Emotionless Magic) - Qín Tiānrán, 秦天然
      Qin Tianran|Qín Tiānrán
      ## Qiu Fei (Excellent Era, Battle Mage, Combat Form) - Qiū Fēi, 邱非
      Qiu Fei|Qiū Fēi

      # R
      ## Ruan Yongbin (Wind Howl, Cleric, Soul Healer) - Ruǎn Yǒngbīn
      Ruan Yongbin|Ruǎn Yǒngbīn

      # S
      ## Shu Kexin (Misty Rain, Sharpshooter, None Dare Attack) Shū Kěxīn, 舒可欣
      Shu Kexin|Shū Kěxīn
      ## Shu Keyi (Misty Rain, Sharpshooter, Lower Your Head) Shū Kěyí, 舒可怡
      Shu Keyi|Shū Kěyí
      ## Song Qiying (Tyranny, Striker, River Sunset) - Sòng Qíyīng, Sòng Jīyīng, 宋奇英
      Song Qiying|Sòng Qíyīng
      ## Song Xiao (Blue Rain, Qi Master, Receding Tides) - Sòng Xiǎo, 宋晓
      Song Xiao|Sòng Xiǎo
      ## Su Mucheng (Excellent Era, Happy, Chinese Glory Team, Launcher, Dancing Rain) - Sū Mùchéng, 苏沐橙
      Su Mu cheng|Sū Mùchéng
      mu cheng|Mùchéng
      ## Su Muqiu (Excellent Era, Launcher, Unspecialized, Sharpshooter, Autumn Tree) - Sū Mùqiū, 蘇沐秋
      Su Mu qiu|Sū Mùqiū
      mu qiu|Mùqiū
      ## Sun Xiang (Conquering Clouds, Excellent Era, Samsara, Chinese Glory Team, Berserker, Battle Mage, One Autumn Leaf) - Sūn Xiáng, 孙翔
      Sun Xiang|Sūn Xiáng
      ### I'm guessing?
      little xiang|Little Xiáng
      ## Sun Zheping (Hundred Blossoms, Happy, Heavenly Sword, Berserker, Blossoming Chaos, Another Summer of Sleep) - Sūn Zhépíng, 孙哲平
      Sun Zheping|Sūn Zhépíng
      zheping|Zhépíng

      # T
      ## Tang Hao (Hundred Blossoms, Wind Howl, Chinese Glory Team, Brawler, Delilo, Demon Subduer) - Táng Hào, 唐昊
      Tang Hao|Táng Hào
      ## Tang Rou (Happy, Battle Mage, Soft Mist) Táng Róu, 唐柔
      Tang Rou|Táng Róu
      ## Tao Xuan (Excellent Era (Boss), Battle Mage) Táo Xuān, 陶轩
      Tao Xuan|Táo Xuān
      ## Tian Sen (Royal Style, Exorcist, Peaceful Hermit) Tián Sēn, 田森
      Tian Sen|Tián Sēn
      ## Tong Lin (Samsara, Research) - Tóng Lín
      Tong Lin|Tóng Lín

      # W
      ## Wang Jiexi (Tiny Herb, Chinese Glory Team, Witch, Vaccaria) - Wáng Jiéxī, 王杰希
      Wang Jiexi|Wáng Jiéxī
      Jiexi|Jiéxī
      ## Wei Chen (Blue Rain, Happy, Warlock, Swoksaar, Windward Formation) - Wèi Chēn, 魏琛
      Wei Chen|Wèi Chēn
      ## Wen Kebei (Heavenly Swords, Battle Mage, Homeward Bound) - Wén Kèběi
      Wen Kebei|Wén Kèběi
      ## Wen Li (Excellent Era) - Wén Lǐ
      Wen Li|Wén Lǐ
      ## Wu Chen (Everlasting, Happy, Happy's Guild's Association President, Launcher, Dawn Rifle) - Wǔ Chén
      Wu Chen|Wǔ Chén
      ## Wu Qi (Samsara, Assassin, Cruel Silence) Wú Qǐ, 吴启
      Wu Qi|Wú Qǐ
      ## Wu Xuefeng (Excellent Era, Qi Master, Qi Breaker) - Wú Xuěfēng, 吴雪峰
      Wu Xuefeng|Wú Xuěfēng
      ## Wu Yuce (Void, Ghostblade, Carved Ghost) - Wú Yǔcè, 吴羽策
      Wu Yuce|Wú Yǔcè

      # X
      ## Xia Ming (Excellent Era, Sharpshooter, Heaven) - Xià Míng, 夏茗
      Xia Ming|Xià Míng
      ## Xiao Shiqin (Thunderclap, Excellent Era, Chinese Glory Team, Mechanic, Life Extinguisher) - Xiāo Shíqīn, 肖时钦
      Xiao Shiqin|Xiāo Shíqīn
      ## Xu Bin (301 Degrees, Tiny Herb, Knight, Angelica) - Xǔ Bīn, 许斌
      Xu Bin|Xǔ Bīn
      ## Xu Boyuan (Blue Brook Guild, Blade Master, Blue River) Xǔ Bóyuǎn, Lán Hé | Blue River, 许博远
      Xu Boyuan|Xǔ Bóyuǎn
      ## Xu Jingxi (Blue Rain, Paladin, Soul Speaker) Xú Jǐngxī, 徐景熙
      Xu Jingxi|Xú Jǐngxī

      # Y
      ## Yang Cong (301 Degrees, Assassin, Scene Killer) Yáng Cōng, 杨聪
      Yang Cong|Yáng Cōng
      ## Yang Haoxuan (Void, Launcher, Translucent) Yáng Hàoxuān
      Yang Haoxuan|Yáng Hàoxuān
      ## Yang Li (Tyranny, Research & Development) - Yáng Lí
      Yang Li|Yáng Lí
      ## Ye Qiu (Ye Xiu twin brother) - Yè Qiū, 叶秋
      Ye Qiu|Yè Qiū
      ## Ye Xiu (Excellent Era, Happy, Chinese Glory Team, Battle Mage, Unspecialized, Lord Grim, One Autumn Leaf) - Yè Xiū, 叶修
      Ye Xiu|Yè Xiū
      ye family|Yè family
      ## Yu Feng (Blue Rain, Hundred Blossoms, Berserker, Brilliant Edge, Blossoming Chaos) Yú Fēng, 于锋
      Yu Feng|Yú Fēng
      ## Yu Nian (Samsara) - Yú Niàn
      Yu Nian|Yú Niàn
      ## Yu Wenzhou (Blue Rain, Chinese Glory Team, Warlock, Swoksaar) - Yù Wénzhōu, 喻文州
      Yu Wenzhou|Yù Wénzhōu
      Wenzhou|Wénzhōu

      # Z
      ## Zhang Jiale (Hundred Blossoms, Tyranny, Chinese Glory Team, Spitfire, Dazzling Hundred Blossoms) - Zhāng Jiālè, 张佳乐
      Zhang Jiale|Zhāng Jiālè
      jiale|Jiālè
      ## Zhang Lintao (Seaside) - Zhāng Líntāo
      Zhang Lintao|Zhāng Líntāo
      ## Zhang Xinjie (Tyranny, Chinese Glory Team, Cleric, Immovable Rock) - Zhāng Xīnjié, 张新杰
      Zhang Xinjie|Zhāng Xīnjié
      ## Zhang Yiwei (Samsara, Mysterious Fantasy (Coach), Sharpshooter, Cloud Piercer) - Zhāng Yìwě, 张益玮
      Zhang Yiwei|Zhāng Yìwě
      ## Zhao Yang (Seaside, Qi Master, Boundless Sea) Zhào Yáng, Zhōu Yáng (misstag, typo?) 赵杨
      Zhao Yang|Zhào Yáng
      zhou yang|Zhōu Yáng
      ## Zheng Xuan (Blue Rain, Spitfire, Bullet Rain) - Zhèng Xuān, 郑轩
      Zheng Xuan|Zhèng Xuān
      ## Zhong Yeli (Heavenly Swords, Cleric, Thousand Falling Leaves) - Zhōng Yèlí
      Zhong Yeli|Zhōng Yèlí
      ## Zhou Zekai (Samsara, Chinese Glory Team, Sharpshooter, Cloud Piercer) - Zhōu Zékǎi, 周泽楷
      Zhou Zekai|Zhōu Zékǎi
      zekai|Zékǎi
      ## Zou Yuan (Hundred Blossoms, Spitfire, Brilliant Blossoms) - Zōu Yuǎn, 邹远
      Zou Yuan|Zōu Yuǎn
      ## Zou Yunhai (Heavenly Sword, Elementalist, Ocean Ahead) - Zōu Yúnhǎi
      Zou Yunhai|Zōu Yúnhǎi

      # Avatars (specifically names/titles with pinyin mentioned in that list)
      ## Autumn Tree (Su Muqiu) - Qiū Mù Sū | Qiumu Su
      qiu mu su|Qiū Mù Sū
      ## Blossoming Chaos (Sun Zheping, Yu Feng) - Luò Huā Láng Jí | Blossoming Chaos
      luo hua lang ji|Luò Huā Láng Jí
      ## Blue River (Xu Boyuan/Blue River) Lán Hé | Blue River
      lan he|Lán Hé
      ## Cloud Piercer (Zhou Zekai) - Yī Qiāng Chuān Yún | Cloud Piercer
      yi qiang chuan yun|Yī Qiāng Chuān Yún
      ## Dancing Rain (Su Mucheng, Su Muqiu) - Mù Yǔ Chéng Fēng | Dancing Rain
      mu yu cheng feng|Mù Yǔ Chéng Fēng
      ## Dazzling Hundred Blossoms (Zhang Jiale, Zou Yuan) - Bǎihuā Liáoluàn | Dazzling Hundred Blossoms
      baihua liaoluan|Bǎihuā Liáoluàn
      ## Deception (Mo Fan) - Huǐ Rén Bú Juàn | Deception
      hui ren bu juan|Huǐ Rén Bú Juàn
      ## Desert Dust (Han Wenqing) - Dà Mò Gū Yān | Desert Dust
      da mo gu yan|Dà Mò Gū Yān
      ## Empty Waves (Jiang Botao - Ye Xiu) - Wú Làng | Empty Waves
      wu lang|Wú Làng
      ## Immovable Rock (Zhang Xinjie) - Shí Bùzhuǎn | Immovable Rock
      shi buzhuan|Shí Bùzhuǎn
      ## Lord Grim (Ye Xiu, Su Muqiu) - Jūn Mò Xiào | Lord Grim
      jun mo xiao|Jūn Mò Xiào
      ## One Autumn Leaf (Ye Xiu, Sun Xiang) - Yī Yè Zhī Qiū | One Autumn Leaf
      yi ye zhi qui|Yī Yè Zhī Qiū
      ## Soft Mist (Tang Rou - Ye Xiu) - Hán Yān Róu | Soft Mist
      han yan rou|Hán Yān Róu
      ## Steamed Bun Invasion (Bao Rongxing) - Bāo Zi Rù Qīn | Steamed Bun Invasion
      bao zi ru qin|Bāo Zi Rù Qīn
      ## Swoksaar (Yu Wenzhou, Wei Chen, Fang Shijing) - Suǒ Kèsà'ěr | Swoksaar
      suo kesa er|Suǒ Kèsà'ěr
      suo kesa'er|Suǒ Kèsà'ěr
      ## Troubling Rain (Huang Shaotian) - Yè Yǔ Shēng Fán | Troubling Rain
      ye yu sheng fan|Yè Yǔ Shēng Fán
      ## Vaccaria (Wang Jiexi, Lin Jie) - Wáng Bù Liú Xíng | Vaccaria
      wang bu liu xing|Wáng Bù Liú Xíng

      # Other Tags
      ## Little Dot - Xiáo Diǎn | Little Dot (Quánzhí Gāoshǒu)
      xiao dian|Xiáo Diǎns
      ## Sister Yang - Sister Yáng (全职高手 | The King's Avatar)
      sister yang|Sister Yáng
      ### idk lol
      yang mei|Yáng mèi
      ## Blue Rain - Lán Yǔ | Team Blue Rain
      lan yu|Lán Yǔ
      ## Excellent Era - Jiā Shì | Team Excellent Era
      jia shi|Jiā Shì
      ## Happy - Xīng Xīn | Team Happy
      xing xin|Xīng Xīn
      ## Heavenly Swords - Yì Zhǎn | Team Heavenly Swords
      yi zhan|Yì Zhǎn
      ## Misty Rain - Yān Yǔ | Team Misty Rain
      yan yu|Yān Yǔ
      ## Royal Style - Huáng Fēng | Team Royal Style
      huang feng|Huáng Fēng
      ## Samsara - Lún Huí | Team Samsara
      lun hui|Lún Huí
      ## Seaside - Lín Hǎi | Team Seaside
      lin hai|Lín Hǎi
      ## Thunderclap - Léi Tíng | Team Thunderclap
      lei ting|Léi Tíng
      ## Tiny Herb - Wēicǎo | Team Tiny Herb
      weicao|Wēicǎo
      ## Tyranny - Bàtú | Team Tyranny
      batu|Bàtú
      `;
}

/**
 * Hard-coded Tiān Guān Cì Fú pinyin replacement rules.
 */
function tgcfReplacements() {
  return `
      # Tiān Guān Cì Fú
      tian guan ci fu|Tiān Guān Cì Fú

      # Items
      ## Cursed Shackles (咒枷, Zhòu Jiā)
      zhou jia|Zhòu Jiā
      ## Deathly Spirit Butterflies (死灵蝶, Sǐ Líng Dié)
      si ling die|Sǐ Líng Dié
      ## E-Ming (厄命, È-Mìng)
      e ming|È-Mìng
      ## Fang Xin (芳心剑, Fāngxīn Jiàn)
      fang xin jian|Fāngxīn Jiàn
      fang xin|Fāngxīn
      ## Form Revealing Water (现形水, Xiànxíng Shuǐ)
      xian xing shui|Xiànxíng Shuǐ
      xian xing|Xiànxíng
      ## Ghost Scent Candy (鬼味糖, Guǐ Wèi Táng)
      gui wei tang|Guǐ Wèi Táng
      ## The Golden Longevity Lockets (长命金锁, Chángmìng Jīn Suǒ)
      chang ming jin suo|Chángmìng Jīn Suǒ
      ## Hong Jing (红镜, Hóngjìng)
      hong jing|Hóngjìng
      ## Incorruptible Chastity Meatballs (玉洁冰清丸, Yù Jié Bīng Qīng Wán)
      yu jie bing qing wan|Yù Jié Bīng Qīng Wán
      ## Love for All Seasons (百年好合羹, Bǎinián Hǎo Hé Gēng)
      bai nian hao he gang|Bǎinián Hǎo Hé Gēng
      ## The Rain Master Hat (雨师笠, Yǔ Shī Lì)
      yu shi li|Yǔ Shī Lì
      ## The red string (红线, hóngxiàn)
      hong xian|hóngxiàn
      ## Ruoye (若邪, Ruòyé)
      ruo ye|Ruòyé
      ## Shanyue Fern (善月草, Shànyuè Cǎo)
      shan yue cao|Shànyuè Cǎo
      shan yue|Shànyuè
      ## Toppled Phoenixes (颠鸾倒凤 Diān Luán Dào Fèng)
      dian luan dao feng|Diān Luán Dào Fèng
      ## The Water Master Fan (水师扇, Shuǐ Shī Shàn)
      shui shi shan|Shuǐ Shī Shàn
      ## The Wind Master Fan (风师扇, Fēng Shī Shàn)
      feng shi shan|Fēng Shī Shàn
      ## Yan Zhen (豔貞, Yàn Zhēn)
      yan zhen|Yàn Zhēn
      ## Yulong (雨龙, Yǔlóng)
      yu long|Yǔlóng

      # canonical chars on ao3, supplemented with alternate titles from the wiki
      butcher zhu|Butcher Zhū
      ## Banyue (半月, Bànyuè) (place)
      banyue|Bànyuè
      ## Ban Yue (person)
      ban yue|Bàn Yuè
      bai jin|Bái Jǐn
      bai wu xiang|Bái Wúxiàng
      cuo cuo|Cuòcuò
      cang qiong|Cāng Qióng
      fu yao|Fú Yáo

      # 风信 - Fēng Xìn
      feng xin|Fēng Xìn
      ## 南阳将军, Nán Yáng jiāngjūn - General Nan Yang (南 nán - southern, 阳 yáng - sun)
      ## Nan Yang Zhen Jun ?
      nan yang jiang jun|Nán Yáng jiāngjūn
      nan yang|Nán Yáng
      ## 巨阳将军, Jù Yáng jiāngjūn - General Ju Yang
      ju yang jiang jun|Jù Yáng jiāngjūn
      ju yang|Jù Yáng
      ## weapon: 风神弓, Fēngshén Gōng (lit. Wind God Bow)
      feng shen gong|Fēngshén Gōng

      gu zi|Gǔzi

      # 花城 - Huā Chéng
      ## 花城主, Huā Chéngzhǔ - City Master
      hua cheng zhu|Huā Chéngzhǔ
      hua cheng|Huā Chéng
      ## 红儿, Hónghóng-er - Red
      hong hong er|Hónghóng'ér
      hong hong'er|Hónghóng'ér
      hong er|Hóng'ér
      hong'er|Hóng'ér
      ## 血雨探花, Xuè Yǔ Tàn Huā - Crimson Rain Sought Flower
      xue yu tan hua|Xuè Yǔ Tàn Huā
      ## 三郎, Sān Láng - Third Son
      san lang|Sān Láng
      ## 无名, Wú Míng - Nameless
      wu ming|Wú Míng
      ## 小花, Xiǎo Huā - Little Flower (Puqi Villagers)
      xiao hua|xiăo-Huā

      # 贺玄 - Hè Xuán
      he xuan|Hè Xuán
      # 黑水沉舟, Hēi Shuǐ Chén Zhōu - Black Water Submerging Boats
      Hei Shui Chen Zhou|Hēi Shuǐ Chén Zhōu
      ## The Black Water Demon Lair (黑水鬼域, Hēi Shuǐ Guǐ Yù)
      hei shui gui yu|Hēi Shuǐ Guǐ Yù
      # 黑水, Hēi Shuǐ - Black Water
      hei shui|Hēi Shuǐ

      jian lan|Jiàn Lán
      jian yu|Jiàn Yù
      jing wen|Jìng Wén

      # 君吾, Jūn Wú - The Lord, I Am
      ## 神武大帝, Shénwǔ Dàdì - Heavenly Martial Emperor
      jun wu|Jūn Wú
      shen wu da di|Shénwǔ Dàdì

      ke mo|Kè Mó
      ming yi|Míng Yí
      lang qian qiu|Láng Qiānqiū
      lang ying|Láng Yíng
      ling wen|Líng Wén
      moxiang tongxiu|Mòxiāng Tóngxiù
      mei nianqing|Méi Niànqīng

      # 慕情 - Mù Qíng
      mu qing|Mù Qíng
      ## 玄真将军, Xuán Zhēn Jiāngjūn - General Xuan Zhen
      ## 玄真 xuán zhēn - enigmatic truth
      xuan zhen jiang jun|Xuán Zhēn jiāngjūn
      xuan zhen|Xuán Zhēn
      # weapon: 斩马刀, Zhǎn Mǎdāo - lit. Chopping Sabre
      zhan ma dao|Zhǎn Mǎdāo

      nan feng|Nán Fēng

      # 裴茗 - Péi Míng
      pei ming|Péi Míng
      ## 明光将军, Míng Guāng Jiāngjūn - General Ming Guang
      ming guang jiang jun|Míng Guāng jiāngjūn
      ## 将军折剑, Jiāngjūn Zhē Jiàn - The General Who Broke His Sword
      jiang jun zhe jian|Jiāngjūn Zhē Jiàn
      ## Ming Guang (明光, Míng Guāng) (former sword)
      ming guang|Míng Guāng
      ## 裴将军, Péi Jiāngjūn - General Pei
      pei jiang jun|Péi jiāngjūn
      ## 裴兄, Péi-xiōng - Brother Pei (to Shi Wudu)
      pei xiong|Péi xiōng
      ## 老裴, Lǎo Péi - Old Pei (to Ling Wen)
      lao pei|lǎo Péi

      pei su|Péi Sù
      quan yizhen|Quán Yīzhēn

      # 戚容, Qī Róng
      ## 青灯夜游, Qīng Dēng Yè Yóu - Night-Touring Green Lantern
      ## 青鬼戚容, Qīng Guǐ Qī Róng - Green Ghost Qi Rong
      ## 小镜, Xiǎo Jìng - Small Mirror (former)
      ## Rong-er (to the Queen)
      qi rong|Qī Róng
      qing gui|Qīng Guǐ
      xiao jing|Xiǎo Jìng
      rong er|Róng'ér
      rong'er|Róng'ér

      rong guang|Róng Guǎng

      # 师青玄 - Shī Qīngxuán
      ## 风师青玄, Fēng Shī Qīng Xuán - Lord Wind Master Qingxuan
      feng shi qing xuan|Fēng Shī Qīngxuán
      ## 风师娘娘, Fēng Shī Niáng Niang - Lady Wind Master
      feng shi niang niang|Fēng Shī niángniang
      feng shi|Fēng Shī
      shi qing xuan|Shī Qīngxuán
      qing xuan|Qīngxuán
      ## 少君倾酒, Shào Jūn Qīng Jiǔ - The Young Lord Who Pours Wine
      shao jun qing jiu|Shàojūn Qīng Jiǔ

      # 师无渡 - Shī Wúdù
      ## 水师无渡, Shuǐ Shī Wúdù - Water Master Wudu
      shui shi wu du|Shuǐ Shī Wúdù
      shi wu du|Shī Wúdù
      wu du|Wúdù
      ## 水横天, Shuǐ Héngtiān - Water Tyrant
      shui heng tian|Shuǐ Héngtiān
      heng tian|Héngtiān
      ## 哥, Gē - Older Brother (to Shi Qingxuan)
      ## 水师兄, Shuǐ Shī-xiōng - Brother Water Master (to Pei Ming)
      shui shi xiong|Shuǐ Shī xiōng

      tian sheng|Tiān Shēng

      # 谢怜 - Xiè Lián
      xie lian|Xiè Lián
      ## 太子殿下, Tài Zǐ Diànxià - His Royal Highness the Crown Prince
      tai zi dian xia|Tàizǐ Diànxià
      ## 花冠武神, Huā Guān Wǔ Shén - Flower Crown Martial God
      hua guan wu shen|Huā Guān Wǔ Shén
      ## 太子悦神, Tài Zǐ Yuè Shén - His Highness Who Pleased the Gods
      tai zi yue shen|Tàizǐ Yuè Shén
      ## 花将军, Huā Jiāng Jūn - General Huā
      hua jiang jun|Huā jiāngjūn
      ## 花谢 - Huā Xiè
      hua xie|Huā Xiè
      ## 哥哥, Gēge - Older Brother (Hua Cheng)
      ## 太子表哥, Tàizǐ Biǎo Gē - Cousin Crown Prince (to Qi Rong)
      tai zi biao ge|Tàizǐ biǎogē

      xiao ying|Xiǎo Yíng
      xuan ji|Xuān Jī

      # 引玉 - Yǐn Yù
      ## 下弦月使, Xiàxián Yuè Shǐ - Waning Moon Officer
      ## 师兄, Shīxiōng - Older disciple brother (to Quan Yizhen)
      yin yu|Yǐn Yù
      xia xian yue shi|Xiàxián Yuè Shǐ

      yushi huang|Yǔshī Huáng
      an le|Ān Lè

      # Places (from wiki)
      ## Banming (半命, Bànmìng; lit. Half-life)
      ban ming|Bànmìng
      ## The Cave of Ten Thousand Gods (万神窟, Wàn Shén Kū)
      wan shen ku|Wàn Shén Kū
      ## The Gambler's Den (间赌坊, Jiān Dǔ Fāng)
      jian du fang|Jiān Dǔ Fāng
      ## The Ghost City (鬼市, Guǐ Shì)
      gui shi|Guǐ Shì
      ## The Heavenly Capital (仙京, Xiān Jīng)
      xian jing|Xiān Jīng
      ## Paradise Manor (极乐坊, Jílè Fāng)
      ji le fang|Jílè Fāng
      ji le|Jílè
      ## Qiandeng Temple (千灯庙, Qiāndēng Miào)
      qian deng miao|Qiāndēng Miào
      qian deng|Qiāndēng
      ## Taicang Mountain (太苍山, Tàicāng Shān)
      tai cang shan|Tàicāng Shān
      ## Tonglu Mountain (铜炉山, Tónglú Shān)
      tong lu shan|Tónglú Shān
      tong lu|Tónglú
      ## Wuyong (乌庸, Wūyōng)
      wu yong|Wūyōng
      ## Xianle (仙乐, Xiānlè)
      xian le|Xiānlè
      ## Xuli Kingdom (须黎, Xūlí)
      xu li|Xūlí
      ## Yong'an (永安, Yǒng'ān)
      yong an|Yǒng'ān
      yong'an|Yǒng'ān
      ## Yu Jun Mountain (与君山, Yǔ Jūn Shān)
      yu jun shan|Yǔ Jūn Shān
      yu jun|Yǔ Jūn
      ## Yushi (雨师, Yǔshī)
      yu shi|Yǔshī

      # Misc
      ## Ascension (飞升, Fēishēng)
      fei sheng|Fēishēng
      ## Cultivation (修炼 xiūliàn, 修真 xiūzhēn, 修行 xiūxíng or 修仙 xiūxiān)
      xiu lian|xiūliàn
      xiu zhen|xiūzhēn
      xiu xing|xiūxíng
      xiu xian|xiūxiān
      ## The Four Famous Tales (四名景, Sì Míng Jǐng)
      si ming jing|Sì Míng Jǐng
      ## The Four Great Calamities (四大害, Sì Dà Hài)
      si da hai|Sì Dà Hài
      ## Ghosts (鬼, Guǐ)
      gui|Guǐ
      ## Gods/Heavenly Officials (神官, Shénguān)
      shen guan|Shénguān
      ## The Jade Emperor (yùdì)
      yu di|yùdì
      ## The Three Tumors (三毒瘤, Sān Dúliú)
      san du liu|Sān Dúliú

      ## various titles
      shi xiong|shīxiōng
      ge ge|gēge
      biao ge|biǎogē
      ge|gē
      shao jun|shàojūn
      jiang jun|jiāngjūn
      `;
}
})();
