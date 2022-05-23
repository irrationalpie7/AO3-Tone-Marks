export const mdzs = {
  fandomRegex: 'Untamed|Módào',
  replacementString: `
    # Yunmeng Jiang Sect and related stuff
    ## Wei Ying (魏婴 Wèi Yīng), courtesy name Wei Wuxian (魏无羡, Wèi Wúxiàn) and his title Yiling Patriarch (夷陵老祖, Yílíng Lǎozǔ)
    wei ying|Wèi Yīng
    wei wuxian|Wèi Wúxiàn
    wy|Wèi Yīng
    wwx|Wèi Wúxiàn
    a xian|Ā-Xiàn
    young master wei|Young Master Wèi
    yiling patriarch|Yílíng Patriarch
    yiling laozu|Yílíng Lǎozǔ
    yiling wei|Yílíng Wèi
    yiling|Yílíng
    laozu|Lǎozǔ
    wei|Wèi
    wuxian|Wúxiàn
    # little apple (the donkey) (小苹果 xiăo píngguǒ)
    xiao ping guo|xiăo-Píngguǒ
    ## Jiang Cheng (江澄 Jiāng Chéng), courtesy name Jiang Wanyin (江晚吟 Jiāng Wǎnyín), and his title Sandu Shengshou (三毒圣手 Sāndú shèngshǒu)
    jiang cheng|Jiāng Chéng
    jiang wanyin|Jiāng Wǎnyín
    wanyin|Wǎnyín
    jwy|Jiāng Wǎnyín
    jc|Jiāng Chéng
    a cheng|Ā-Chéng
    sandu shengshou|Sāndú Shèngshǒu
    sandu|Sāndú
    shengshou|Shèngshǒu
    ## Yu Ziyuan (虞紫鸢, Yú Zǐyuān) and title Madam Yu (虞夫人, Yú fūrén) and the Violet Spider (紫蜘蛛, Zǐ Zhīzhū).
    yu ziyuan|Yú Zǐyuān
    yzy|Yú Zǐyuān
    yu furen|Yú fūrén
    madame yu|Madame Yú
    zi zhizhu|Zǐ Zhīzhū
    ziyuan|Zǐyuān
    ## Jiang Fengmian (江枫眠, Jiāng Fēngmián)
    jiang fengmian|Jiāng Fēngmián
    fengmian|Fēngmián
    jfm|Jiāng Fēngmián
    ## Jiang Yanli (江厌离, Jiāng Yànlí)
    jiang yanli|Jiāng Yànlí
    jyl|Jiāng Yànlí
    yanli|Yànlí
    ## hmmmmmm technically this could also be the unit "a li" (~.5 km), so maybe remove
    a li|Ā-Lí
    ## Zidian (紫电, Zǐdiàn), Chenqing  陈情 Chén qíng, Suibian 随便 Suíbiàn
    zidian|Zǐdiàn
    chenqing|Chénqíng
    suibian|Suíbiàn
    ## Yunmeng Jiang Sect (云梦江氏, Yúnmèng Jiāng Shì)
    sect leader jiang|Sect Leader Jiāng
    yunmeng jiang shi|Yúnmèng Jiāng Shì
    yunmeng jiang|Yúnmèng Jiāng
    yunmeng|Yúnmèng
    jiang|Jiāng

    # Lanling Jin Sect
    ## Jin Zixuan (金子轩, Jīn Zixuān)
    jin zixuan|Jīn Zixuān
    jz xuan|Jīn Zixuān
    zixuan|Zixuān
    ## Jin Ling (金凌, Jīn Líng), courtesy name Jin Rulan (金如兰, Jīn Rúlán)
    jin ling|Jīn Líng
    a ling|Ā-Líng
    jl|Jīn Líng
    jin rulan|Jīn Rúlán
    jrl|Jīn Rúlán
    rulan|Rúlán
    ## Jin Guangshan (金光善, Jīn Guāngshàn)
    jin guangshan|Jīn Guāngshàn
    jgs|Jīn Guāngshàn
    ## Jin Guangyao (金光瑶, Jīn Guāngyáo), birth name Meng Yao (孟瑶, Mèng Yáo)
    jin guangyao|Jīn Guāngyáo
    jgy|Jīn Guāngyáo
    guangyao|Guāngyáo
    meng yao|Mèng Yáo
    a yao|Ā-Yáo
    ## Mo Xuanyu (莫玄羽, Mò Xuányǔ)
    mo xuanyu|Mò Xuányǔ
    mxy|Mò Xuányǔ
    xuanyu|Xuányǔ
    senior mo|Senior Mò
    ## Mian Mian (Chinese: 绵绵; Miánmián)
    mian mian|Miánmián
    luo qingyang|Luó Qīngyáng
    lqy|Luó Qīngyáng
    qingyang|Qīngyáng
    ## Other
    jin zixun|Jīn Zixūn
    jz xun|Jīn Zixūn
    zixun|Zixūn
    ## Qín Sù 秦愫
    qin su|Qín Sù
    qs|Qín Sù
    ## Carp Tower (金鳞台, Jīnlín Tái; also: Koi Tower, Jinlin Tower)
    jin lin tower|Jīnlín Tower
    jin lin tai|Jīnlín Tái
    ## Lanling Jin Sect (兰陵金氏, Lánlíng Jīn Shì)
    langling jin shi|Lánlíng Jīn Shì
    langling jin|Lánlíng Jīn
    lanling|Lánlíng
    jin|Jīn

    # Gusu Lan Sect
    ## Lan Zhan (蓝湛 Lán Zhàn), courtesy name Lan Wangji (蓝忘机, Lán Wàngjī) , and title Hanguang-Jun (含光君, Hánguāng-jūn),
    lan zhan|Lán Zhàn
    zhan|Zhàn
    lan wang ji|Lán Wàngjī
    lwj|Lán Wàngjī
    lz|Lán Zhàn
    wangji|Wàngjī
    hanguang jun|Hánguāng-jūn
    hgj|Hánguāng-jūn
    master lan|Master Lán
    ## Lan Qiren (蓝启仁, Lán Qǐrén)
    lan qiren|Lán Qǐrén
    lqr|Lán Qǐrén
    qiren|Qǐrén
    ## Lan Huan (蓝涣, Lán Huàn), courtesy name Lan Xichen (蓝曦臣, Xīchén) and title Zewu-Jun (泽芜君, Zéwú-jūn)
    lan huan|Lán Huàn
    lh|Lán Huàn
    lan xichen|Lán Xīchén
    lxc|Lán Xīchén
    xichen|Xīchén
    zewu jun|Zéwú-jūn
    zwj|Zéwú-jūn
    ## Lan Yuan (蓝愿, Lán yuàn) courtesy name Lan Sizhui (思追, Lán Sīzhuī) and born Wen Yuan (温苑, Wēn yuàn)
    lan yuan|Lán Yuàn
    a yuan|Ā-Yuàn
    lan sizhui|Lán Sīzhuī
    lsz|Lán Sīzhuī
    sizhui|Sīzhuī
    wen yuan|Wēn Yuàn
    ## Lan Jingyi (蓝景仪, Lán Jǐngyí)
    lan jingyi|Lán Jǐngyí
    ljy|Lán Jǐngyí
    jingyi|Jǐngyí
    ## Caiyi Town (彩衣城, Cǎiyī Chéng)
    caiyi town|Cǎiyī Town
    caiyi cheng|Cǎiyī Chéng
    ## Jìngshì (静室, jìng shì)
    jingshi|Jìngshì
    ## Bichen (避尘, Bìchén)
    bichen|Bìchén
    ## Gusu Lan Sect (姑苏蓝氏, Gūsū Lán Shì), Gusu (姑苏, Gūsū)
    gusu lan shi|Gūsū Lán Shì
    gusu lan|Gūsū Lán
    # don't match lan|Lán because we might miss Song Lan
    gusu|Gūsū

    # Qinghe Nie Sect
    ## Nie Huaisang (聂怀桑, Niè Huáisāng)
    nie huaisang|Niè Huáisāng
    nhs|Niè Huáisāng
    huaisang|Huáisāng
    ## Nie Mingjue (聂明玦, Niè Míngjué)
    nie mingjue|Niè Míngjué
    nmj|Niè Míngjué
    mingjue|Míngjué
    ## Other
    nie zonghui|Niè Zōnghuī
    nzh|Niè Zōnghuī
    zonghui|Zōnghuī
    ## Qinghe Nie Sect (清河聂氏, Qīnghé Niè Shì)
    qinghe nie shi|Qīnghé Niè Shì
    qinghe nie|Qīnghé Niè
    qinghe|Qīnghé
    nie|Niè

    # Qishan Wen Sect
    ## Wen Ning (温宁, Wēn Níng), courtesy name Qionglin (温琼林, Qiónglín)  Known as the Ghost General (鬼将军, Guǐ jiāngjūn)
    Wen Ning|Wēn Níng
    wn|Wēn Níng
    Wen Qionglin|Wēn Qiónglín
    wql|Wēn Qiónglín
    Qionglin|Qiónglín
    Gui Jiangjun|Guǐ jiāngjūn
    ## Wen Qing (温情, Wēn Qíng)
    Wen Qing|Wēn Qíng
    wq|Wēn Qíng
    ## Wen Ruohan (温若寒, Wēn Ruòhán)
    Wen Ruohan|Wēn Ruòhán
    wrh|Wēn Ruòhán
    ## Wen Chao (温晁, Wēn Cháo)
    Wen Chao|Wēn Cháo
    wc|Wēn Cháo
    ## Wen Xu (温旭, Wēn Xù)
    Wen Xu|Wēn Xù
    wx|Wēn Xù
    ## Wen Zhuliu (Wēn Zhúliú 温逐流)
    Wen Zhu Liu|Wēn Zhúliú
    wzl|Wēn Zhúliú
    Zhu Liu|Zhúliú
    ## Qishan Wen Sect (岐山温氏, Qíshān Wēn Shì)
    Qishan Wen Shi|Qíshān Wēn Shì
    Qishan Wen|Qíshān Wēn
    Qishan|Qíshān
    Da Fan Wen|Dàfàn Wēn
    Wen|Wēn

    # misc people
    ## Sū Shè 苏涉 / Mǐnshàn 悯善
    su she|Sū Shè
    su minshan|Sū Mǐnshàn
    ## Song Lan (宋岚, Sòng Lán), courtesy name Song Zichen (宋子琛)
    Song Lan|Sòng Lán
    sl|Sòng Lán
    Song Zichen|Sòng Zichēn
    szc|Sòng Zichēn
    Zichen|Zichēn
    ## Fuxue (拂雪, Fúxuě)
    Fuxue|Fúxuě
    ## Xiao Xingchen (晓星尘, Xiǎo Xīngchén)
    Xiao Xingchen|Xiǎo Xīngchén
    xxc|Xiǎo Xīngchén
    Xingchen|Xīngchén
    ## Shuanghua (霜华, Shuānghuá)
    Shuanghua|Shuānghuá
    ## Xue Yang (薛洋, Xuē Yáng) (薛成美, Xuē Chéngměi)
    Xue Yang|Xuē Yáng
    xy|Xuē Yáng
    xue chengmei|Xuē Chéngměi
    xcm|Xuē Chéngměi
    ## Baoshan Sanren (抱山散人, Bàoshān sànrén)
    Baoshan Sanren|Bàoshān Sànrén
    ## Cangse Sanren (藏色散人, Cángsè Sànrén)
    Cangse Sanren|Cángsè Sànrén
    cssr|Cángsè Sànrén
    Zangse Sanren|Zángsè Sànrén
    zssr|Zángsè Sànrén
    ## Ouyang Zizhen (欧阳子真 Ōuyáng Zizhēn)
    Ouyang Zizhen|Ōuyáng Zizhēn
    oyzz|Ōuyáng Zizhēn

    # misc other
    ## gongzi (公子, gōngzī)
    Gongzi|gōngzī
    ## guqin ( Chinese: 古琴;  pinyin: gǔqín)
    Guqin|gǔqín
    ## Yi City (Chinese: 义城; pinyin: Yì chéng)
    Yi City|Yì City
    Yi Cheng|Yì Chéng
    ## Dafan Mountain (大梵山, Dà fàn shān)
    Da Fan Mountain|Dàfàn Mountain
    Da Fan Shan|Dàfàn shān
    ## 大哥 dà gē
    da ge|dàgē
    ## ge (Chinese: 哥; pinyin: gē)
    -Ge|-gē
    ## Gege (Chinese: 哥哥; pinyin: Gégé)
    Gege|gēge
    ## xiōngzhǎng 兄长
    xiong zhang|Xiōngzhǎng
    ## xiong (兄 Xiōng)
    -Xiong|-xiōng
    ## Jiejie (Chinese: 姐姐, Jiějiě)
    Jiejie|jiějiě
    ## shī jiě 师姐
    Shijie|shījiě
    ## Jie (Chinese: 姐, Jiě)
    -Jie|-jiě
    ## qiánkūn dài 乾坤袋 (Qiankun bag)
    qiankun dai|qiánkūn dài
    qiankun|qiánkūn
    ## Hánshì 寒室 - LXC’s room
    hanshi|Hánshì
    ## Míngshì 冥室 - Building where they do summonings
    mingshi|Míngshì
    ## Yǎshì 雅室 - For receiving visitors
    yashi|Yǎshì
    ## Lánshì 兰室 - Classroom
    lanshi|Lánshì
    ## qín 琴
    qin|qín
    ## dízì 笛子 - bamboo flute
    dizi|dízì
    ## xiāo 箫 - LXC’s flute -- omitted due to # of conflicts:
    ## xiao|xiāo [flute]/xiăo [small]/Xiǎo [xxc]

    # attempt to match lan|Lán at the end, after conflict with Song Lan doesn't matter
    lan|Lán
    `
};