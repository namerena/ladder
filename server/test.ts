import {FileStorage} from './lib/Storage';

let data: any = {
  飞马座: ['π7491星', 'θ2635星', 'ε1619星', 'δ9141星', 'ς2861星'],
  仙女座: ['η2053星', 'δ6989星', 'γ5372星', 'ι1613星', 'ο3886星'],
  天龙座: ['υ6307星', 'ς6972星', 'ε2254星', 'β1301星', 'μ6052星'],
  天鹅座: ['μ0484星', 'υ8402星', 'ο5950星', 'δ1109星', 'θ8535星'],
  凤凰座: ['ω4067星', 'α4160星', 'μ0053星', 'ψ4092星', 'λ4957星'],
  宝瓶座: ['λ0674星', 'μ5531星', 'ρ4582星', 'ω7757星', 'τ5390星'],
  白羊座: ['ι2906星', 'φ4140星', 'χ2068星', 'ε7185星', 'υ9356星'],
  巨蟹座: ['λ7641星', 'ψ9743星', 'κ5628星', 'α7928星', 'μ8651星'],
  摩羯座: ['θ9818星', 'λ0874星', 'φ1719星', 'τ1186星', 'β3336星'],
  巨爵座: ['ζ8728星', 'λ6915星', 'ι8803星', 'η0319星', 'ν2021星'],
  双子座: ['τ6001星', 'μ6456星', 'ψ9348星', 'ε0141星', 'λ6878星'],
  狮子座: ['π8251星', 'φ4162星', 'ζ1469星', 'χ6788星', 'ψ5045星'],
  天秤座: ['η7488星', 'κ9843星', 'ψ5334星', 'θ4737星', 'ο1621星'],
  室女座: ['ξ1451星', 'ι2394星', 'ψ8611星', 'μ2026星', 'ν9360星'],
  人马座: ['ε7379星', 'η8269星', 'κ6263星', 'ξ6769星', 'φ6824星'],
  天蝎座: ['τ4946星', 'ν1827星', 'β2616星', 'λ3721星', 'α7464星'],
  金牛座: ['φ1043星', 'ς0723星', 'δ1508星', 'ω2418星', 'ξ5681星'],
  唧筒座: ['β726星', 'χ998星', 'γ692星', 'η659星', 'τ860星'],
  天燕座: ['ε854星', 'ζ159星', 'ρ504星', 'τ718星', 'γ298星'],
  天鹰座: ['κ724星', 'φ387星', 'υ792星', 'ψ255星', 'λ777星'],
  天坛座: ['ω826星', 'χ380星', 'ν631星', 'φ937星', 'θ493星'],
  御夫座: ['χ548星', 'ρ409星', 'α465星', 'ν670星', 'ζ642星'],
  牧夫座: ['ι400星', 'λ214星', 'ξ943星', 'χ698星', 'β326星'],
  雕具座: ['ψ137星', 'υ112星', 'ο359星', 'κ634星', 'η299星'],
  鹿豹座: ['ψ435星', 'η365星', 'σ028星', 'β560星', 'γ193星'],
  猎犬座: ['ν709星', 'λ789星', 'γ725星', 'ψ971星', 'ρ728星'],
  大犬座: ['θ744星', 'τ085星', 'ς727星', 'ψ912星', 'ι005星'],
  小犬座: ['θ660星', 'δ965星', 'σ815星', 'ν025星', 'α495星'],
  船底座: ['ν855星', 'ζ380星', 'π941星', 'φ747星', 'χ196星'],
  仙后座: ['α437星', 'δ775星', 'ι486星', 'μ981星', 'ξ723星'],
  半人马座: ['ς044星', 'ξ900星', 'α371星', 'η680星', 'δ151星'],
  仙王座: ['μ792星', 'ψ564星', 'ξ638星', 'λ620星', 'υ016星'],
  鲸鱼座: ['λ185星', 'φ249星', 'ν682星', 'ρ499星', 'σ731星'],
  蝘蜓座: ['ο080星', 'ι561星', 'λ848星', 'α876星', 'ξ604星'],
  圆规座: ['υ235星', 'ς098星', 'ξ258星', 'ω019星', 'α663星'],
  天鸽座: ['κ841星', 'θ916星', 'ρ253星', 'χ687星', 'ξ177星'],
  后发座: ['θ097星', 'η450星', 'β258星', 'χ826星', 'ψ601星'],
  南冕座: ['α079星', 'μ089星', 'κ848星', 'δ744星', 'π150星'],
  北冕座: ['θ062星', 'β117星', 'ζ447星', 'α878星', 'δ384星'],
  乌鸦座: ['μ100星', 'δ328星', 'ν706星', 'ψ089星', 'β880星'],
  南十字座: ['φ496星', 'κ627星', 'τ019星', 'ψ187星', 'δ142星'],
  海豚座: ['φ632星', 'η997星', 'κ450星', 'ρ513星', 'ξ132星'],
  剑鱼座: ['σ232星', 'φ122星', 'ε556星', 'υ461星', 'η834星'],
  小马座: ['λ790星', 'ε723星', 'υ758星', 'ν744星', 'ζ905星'],
  波江座: ['θ957星', 'ψ692星', 'γ454星', 'ν734星', 'ρ492星'],
  天炉座: ['θ835星', 'ς962星', 'δ500星', 'μ455星', 'ω299星'],
  天鹤座: ['ν997星', 'δ518星', 'θ661星', 'π133星', 'ω812星'],
  武仙座: ['σ865星', 'φ396星', 'δ571星', 'η403星', 'ω126星'],
  时钟座: ['ξ155星', 'γ863星', 'κ281星', 'χ641星', 'ν291星'],
  长蛇座: ['ε281星', 'ζ574星', 'ο393星', 'δ486星', 'α460星'],
  水蛇座: ['α332星', 'β360星', 'υ464星', 'ζ787星', 'ψ481星'],
  印第安座: ['ο890星', 'ξ567星', 'α330星', 'τ648星', 'δ423星'],
  蝎虎座: ['ε100星', 'ι085星', 'θ691星', 'δ678星', 'ω437星'],
  小狮座: ['μ971星', 'δ993星', 'φ976星', 'ο499星', 'σ459星'],
  天兔座: ['α912星', 'ε808星', 'β912星', 'μ540星', 'υ016星'],
  豺狼座: ['η271星', 'γ049星', 'β807星', 'υ399星', 'κ901星'],
  山猫座: ['θ840星', 'τ799星', 'ε455星', 'ζ805星', 'η480星'],
  天琴座: ['λ906星', 'δ898星', 'ζ983星', 'χ766星', 'κ122星'],
  山案座: ['σ488星', 'ν294星', 'χ556星', 'ι475星', 'ς059星'],
  显微镜座: ['σ631星', 'ω696星', 'κ379星', 'λ144星', 'ε200星'],
  麒麟座: ['ε367星', 'θ057星', 'α954星', 'λ951星', 'ι180星'],
  苍蝇座: ['κ659星', 'υ134星', 'γ807星', 'α729星', 'ο226星'],
  矩尺座: ['ξ175星', 'ι513星', 'ς082星', 'θ527星', 'μ357星'],
  南极座: ['η980星', 'σ259星', 'ψ164星', 'χ796星', 'ξ892星'],
  蛇夫座: ['ψ925星', 'ε409星', 'ρ659星', 'μ394星', 'κ971星'],
  猎户座: ['χ323星', 'γ272星', 'ξ263星', 'β954星', 'θ088星'],
  孔雀座: ['η605星', 'δ887星', 'ς222星', 'ζ019星', 'ρ757星'],
  英仙座: ['υ916星', 'θ200星', 'α150星', 'ζ650星', 'δ200星'],
  绘架座: ['ζ307星', 'υ604星', 'σ440星', 'π367星', 'ω091星'],
  双鱼座: ['η057星', 'γ631星', 'θ995星', 'β206星', 'ο973星'],
  南鱼座: ['δ020星', 'γ642星', 'ν758星', 'ρ524星', 'μ473星'],
  船尾座: ['χ598星', 'λ452星', 'ψ694星', 'ρ662星', 'φ679星'],
  罗盘座: ['ι634星', 'λ697星', 'β199星', 'υ911星', 'σ684星'],
  网罟座: ['β619星', 'ς548星', 'π389星', 'ξ769星', 'ω500星'],
  天箭座: ['π416星', 'η533星', 'ο961星', 'ε017星', 'τ475星'],
  玉夫座: ['ς071星', 'γ863星', 'τ950星', 'ν555星', 'θ279星'],
  盾牌座: ['η937星', 'ψ742星', 'γ098星', 'μ026星', 'υ400星'],
  巨蛇座: ['ο703星', 'κ411星', 'θ966星', 'ω679星', 'β561星'],
  六分仪座: ['ξ531星', 'γ606星', 'ε908星', 'ψ149星', 'ω047星'],
  望远镜座: ['α363星', 'δ580星', 'λ641星', 'θ949星', 'ψ702星'],
  三角座: ['γ261星', 'ψ238星', 'λ191星', 'χ689星', 'η020星'],
  南三角座: ['ω480星', 'θ649星', 'η421星', 'β723星', 'σ741星'],
  杜鹃座: ['ι375星', 'τ410星', 'ς849星', 'φ737星', 'ο479星'],
  大熊座: ['σ779星', 'ο154星', 'μ296星', 'ς052星', 'η263星'],
  小熊座: ['θ352星', 'ς259星', 'ν210星', 'π005星', 'χ186星'],
  船帆座: ['α513星', 'ν667星', 'υ024星', 'ω725星', 'β146星'],
  飞鱼座: ['ς606星', 'θ434星', 'β958星', 'μ546星', 'δ740星'],
  狐狸座: ['δ919星', 'ξ598星', 'ψ578星', 'ζ063星', 'χ005星'],
};
let mainStorage = new FileStorage('./storage');
let lastChangeTime = new Date().getTime();
for (let key in data) {
  let names: string[] = data[key];
  names = names.map((str) => ` ${str}`);
  let toSave = {
    'clan': key,
    lastChangeTime,
    '5': {
      names: names.join('\n'),
    },
    '2': {
      names: `${names[1]}\n${names[2]}`,
    },
    '1': {
      names: names[0],
    },
  };
  mainStorage.saveFile(key, JSON.stringify(toSave));
}
