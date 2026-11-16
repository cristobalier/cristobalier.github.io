/* Dexter · ajustes de disponibilidad
   Cargar DESPUÉS de disponibilidad.js. Sirve para corregir juegos sin editar la lista grande.
   Solo AGREGA juegos a cada Pokémon, nunca borra nada.
   Índices: 0 Rojo/Azul · 1 Amarillo · 2 Oro/Plata · 3 Cristal · 4 Rubí/Zafiro · 5 Esmeralda · 6 RF/VH
            7 Diamante/Perla · 8 Platino · 9 HG/SS · 10 Negro/Blanco · 11 N2/B2 · 12 X/Y · 13 ROZA
            14 Sol/Luna · 15 USUL · 16 Let's Go · 17 Espada/Escudo · 18 DBPR · 19 Leyendas: Arceus
            20 Escarlata/Púrpura · 21 Leyendas: Z-A */
(function (D) {
  const add = (n, i) => {
    const a = D.AV[n] || (D.AV[n] = []);
    if (!a.includes(i)) {
      a.push(i);
      a.sort((x, y) => x - y);
    }
  };
  const slug = (n) =>
    n
      .toLowerCase()
      .replace("♀", "-f")
      .replace("♂", "-m")
      .replace("type: null", "type-null")
      .replace(/[’'.:]/g, "")
      .replace(/é/g, "e")
      .replace(/\s+/g, "-");
  const BY_SLUG = {};
  D.REGIONS.forEach((r) =>
    r.pokemon.forEach((n) => {
      BY_SLUG[slug(n)] = n;
    }),
  );

  /* Diamante Brillante / Perla Reluciente: se pueden obtener las 493 especies de Kanto a Sinnoh
     (#001 Bulbasaur a #493 Arceus). Algunos míticos solo por evento o por datos de guardado de otros juegos.
     Las formas de Alola y Galar no están; esas tienen su propia lista en datos/formas.js y no se tocan aquí.
     Fuente: serebii.net/brilliantdiamondshiningpearl/unobtainable.shtml */
  D.REGIONS.slice(0, 4).forEach((r) => r.pokemon.forEach((n) => add(n, 18)));

  /* Pokédex regionales de cada juego moderno, tal como están en PokéAPI (pokeapi.co/api/v2/pokedex/N):
     14 Sol/Luna: original-alola (16) · 15 USUL: updated-alola (21) · 16 Let's Go: letsgo-kanto (26)
     17 Espada/Escudo: galar (27) + isle-of-armor (28) + crown-tundra (29) · 19 Leyendas Arceus: hisui (30)
     20 Escarlata/Púrpura: paldea (31) + kitakami (32) + blueberry (33) · 21 Leyendas Z-A: lumiose-city (34) + hyperspace (35)
     Los nombres van en el formato de PokéAPI (minúsculas y guiones). */
  const DEX = {
    14: "rowlet dartrix decidueye litten torracat incineroar popplio brionne primarina pikipek trumbeak toucannon yungoos gumshoos rattata raticate caterpie metapod butterfree ledyba ledian spinarak ariados pichu pikachu raichu grubbin charjabug vikavolt bonsly sudowoodo happiny chansey blissey munchlax snorlax slowpoke slowbro slowking wingull pelipper abra kadabra alakazam meowth persian magnemite magneton magnezone grimer muk growlithe arcanine drowzee hypno makuhita hariyama smeargle crabrawler crabominable gastly haunter gengar drifloon drifblim misdreavus mismagius zubat golbat crobat diglett dugtrio spearow fearow rufflet braviary vullaby mandibuzz mankey primeape delibird oricorio cutiefly ribombee petilil lilligant cottonee whimsicott psyduck golduck magikarp gyarados barboach whiscash machop machoke machamp roggenrola boldore gigalith carbink sableye rockruff lycanroc spinda tentacool tentacruel finneon lumineon wishiwashi luvdisc corsola mareanie toxapex shellder cloyster bagon shelgon salamence lillipup herdier stoutland eevee vaporeon jolteon flareon espeon umbreon leafeon glaceon sylveon mudbray mudsdale igglybuff jigglypuff wigglytuff tauros miltank surskit masquerain dewpider araquanid fomantis lurantis morelull shiinotic paras parasect poliwag poliwhirl poliwrath politoed goldeen seaking feebas milotic alomomola fletchling fletchinder talonflame salandit salazzle cubone marowak kangaskhan magby magmar magmortar stufful bewear bounsweet steenee tsareena comfey pinsir oranguru passimian goomy sliggoo goodra castform wimpod golisopod staryu starmie sandygast palossand cranidos rampardos shieldon bastiodon archen archeops tirtouga carracosta phantump trevenant nosepass probopass pyukumuku chinchou lanturn type-null silvally zygarde trubbish garbodor skarmory ditto cleffa clefairy clefable minior beldum metang metagross porygon porygon2 porygon-z pancham pangoro komala torkoal turtonator togedemaru elekid electabuzz electivire geodude graveler golem sandile krokorok krookodile trapinch vibrava flygon gible gabite garchomp klefki mimikyu bruxish drampa absol snorunt glalie froslass sneasel weavile sandshrew sandslash vulpix ninetales vanillite vanillish vanilluxe snubbull granbull shellos gastrodon relicanth dhelmise carvanha sharpedo wailmer wailord lapras exeggcute exeggutor jangmo-o hakamo-o kommo-o emolga scyther scizor murkrow honchkrow riolu lucario dratini dragonair dragonite aerodactyl tapu-koko tapu-lele tapu-bulu tapu-fini cosmog cosmoem solgaleo lunala nihilego buzzwole pheromosa xurkitree celesteela kartana guzzlord necrozma magearna marshadow",
    15: "rowlet dartrix decidueye litten torracat incineroar popplio brionne primarina pikipek trumbeak toucannon yungoos gumshoos rattata raticate caterpie metapod butterfree ledyba ledian spinarak ariados buneary lopunny inkay malamar zorua zoroark furfrou pichu pikachu raichu grubbin charjabug vikavolt bonsly sudowoodo happiny chansey blissey munchlax snorlax slowpoke slowbro slowking wingull pelipper abra kadabra alakazam meowth persian magnemite magneton magnezone grimer muk mime-jr mr-mime ekans arbok dunsparce growlithe arcanine drowzee hypno makuhita hariyama smeargle crabrawler crabominable gastly haunter gengar drifloon drifblim murkrow honchkrow zubat golbat crobat noibat noivern diglett dugtrio spearow fearow rufflet braviary vullaby mandibuzz mankey primeape delibird hawlucha oricorio cutiefly ribombee flabebe floette florges petilil lilligant cottonee whimsicott psyduck golduck smoochum jynx magikarp gyarados barboach whiscash seel dewgong machop machoke machamp roggenrola boldore gigalith carbink sableye mawile rockruff lycanroc spinda tentacool tentacruel finneon lumineon wishiwashi luvdisc corsola mareanie toxapex shellder cloyster clamperl huntail gorebyss remoraid octillery mantyke mantine bagon shelgon salamence lillipup herdier stoutland eevee vaporeon jolteon flareon espeon umbreon leafeon glaceon sylveon mareep flaaffy ampharos mudbray mudsdale igglybuff jigglypuff wigglytuff tauros miltank surskit masquerain dewpider araquanid fomantis lurantis morelull shiinotic paras parasect poliwag poliwhirl poliwrath politoed goldeen seaking basculin feebas milotic alomomola fletchling fletchinder talonflame salandit salazzle cubone marowak kangaskhan magby magmar magmortar larvesta volcarona stufful bewear bounsweet steenee tsareena comfey pinsir hoothoot noctowl kecleon oranguru passimian goomy sliggoo goodra castform wimpod golisopod staryu starmie sandygast palossand omanyte omastar kabuto kabutops lileep cradily anorith armaldo cranidos rampardos shieldon bastiodon archen archeops tirtouga carracosta tyrunt tyrantrum amaura aurorus larvitar pupitar tyranitar phantump trevenant natu xatu nosepass probopass pyukumuku chinchou lanturn type-null silvally poipole naganadel zygarde trubbish garbodor minccino cinccino pineco forretress skarmory ditto cleffa clefairy clefable elgyem beheeyem minior beldum metang metagross porygon porygon2 porygon-z pancham pangoro komala torkoal turtonator houndour houndoom dedenne togedemaru electrike manectric elekid electabuzz electivire geodude graveler golem sandile krokorok krookodile trapinch vibrava flygon gible gabite garchomp baltoy claydol golett golurk klefki mimikyu shuppet banette frillish jellicent bruxish drampa absol snorunt glalie froslass sneasel weavile sandshrew sandslash vulpix ninetales vanillite vanillish vanilluxe scraggy scrafty pawniard bisharp snubbull granbull shellos gastrodon relicanth dhelmise carvanha sharpedo skrelp dragalge clauncher clawitzer wailmer wailord lapras tropius exeggcute exeggutor corphish crawdaunt mienfoo mienshao jangmo-o hakamo-o kommo-o emolga scyther scizor heracross aipom ambipom litleo pyroar misdreavus mismagius druddigon lickitung lickilicky riolu lucario dratini dragonair dragonite aerodactyl tapu-koko tapu-lele tapu-bulu tapu-fini cosmog cosmoem solgaleo lunala nihilego stakataka blacephalon buzzwole pheromosa xurkitree celesteela kartana guzzlord necrozma magearna marshadow zeraora",
    16: "bulbasaur ivysaur venusaur charmander charmeleon charizard squirtle wartortle blastoise caterpie metapod butterfree weedle kakuna beedrill pidgey pidgeotto pidgeot rattata raticate spearow fearow ekans arbok pikachu raichu sandshrew sandslash nidoran-f nidorina nidoqueen nidoran-m nidorino nidoking clefairy clefable vulpix ninetales jigglypuff wigglytuff zubat golbat oddish gloom vileplume paras parasect venonat venomoth diglett dugtrio meowth persian psyduck golduck mankey primeape growlithe arcanine poliwag poliwhirl poliwrath abra kadabra alakazam machop machoke machamp bellsprout weepinbell victreebel tentacool tentacruel geodude graveler golem ponyta rapidash slowpoke slowbro magnemite magneton farfetchd doduo dodrio seel dewgong grimer muk shellder cloyster gastly haunter gengar onix drowzee hypno krabby kingler voltorb electrode exeggcute exeggutor cubone marowak hitmonlee hitmonchan lickitung koffing weezing rhyhorn rhydon chansey tangela kangaskhan horsea seadra goldeen seaking staryu starmie mr-mime scyther jynx electabuzz magmar pinsir tauros magikarp gyarados lapras ditto eevee vaporeon jolteon flareon porygon omanyte omastar kabuto kabutops aerodactyl snorlax articuno zapdos moltres dratini dragonair dragonite mewtwo mew meltan melmetal",
    17: "grookey thwackey rillaboom scorbunny raboot cinderace sobble drizzile inteleon blipbug dottler orbeetle caterpie metapod butterfree grubbin charjabug vikavolt hoothoot noctowl rookidee corvisquire corviknight skwovet greedent pidove tranquill unfezant nickit thievul zigzagoon linoone obstagoon wooloo dubwool lotad lombre ludicolo seedot nuzleaf shiftry chewtle drednaw purrloin liepard yamper boltund bunnelby diggersby minccino cinccino bounsweet steenee tsareena oddish gloom vileplume bellossom budew roselia roserade wingull pelipper joltik galvantula electrike manectric vulpix ninetales growlithe arcanine vanillite vanillish vanilluxe swinub piloswine mamoswine delibird snorunt glalie froslass baltoy claydol mudbray mudsdale dwebble crustle golett golurk munna musharna natu xatu stufful bewear snover abomasnow krabby kingler wooper quagsire corphish crawdaunt nincada ninjask shedinja tyrogue hitmonlee hitmonchan hitmontop pancham pangoro klink klang klinklang combee vespiquen bronzor bronzong ralts kirlia gardevoir gallade drifloon drifblim gossifleur eldegoss cherubi cherrim stunky skuntank tympole palpitoad seismitoad duskull dusclops dusknoir machop machoke machamp gastly haunter gengar magikarp gyarados goldeen seaking remoraid octillery shellder cloyster feebas milotic basculin wishiwashi pyukumuku trubbish garbodor sizzlipede centiskorch rolycoly carkol coalossal diglett dugtrio drilbur excadrill roggenrola boldore gigalith timburr gurdurr conkeldurr woobat swoobat noibat noivern onix steelix arrokuda barraskewda meowth perrserker persian milcery alcremie cutiefly ribombee ferroseed ferrothorn pumpkaboo gourgeist pichu pikachu raichu eevee vaporeon jolteon flareon espeon umbreon leafeon glaceon sylveon applin flapple appletun espurr meowstic swirlix slurpuff spritzee aromatisse dewpider araquanid wynaut wobbuffet farfetchd sirfetchd chinchou lanturn croagunk toxicroak scraggy scrafty stunfisk shuckle barboach whiscash shellos gastrodon wimpod golisopod binacle barbaracle corsola cursola impidimp morgrem grimmsnarl hatenna hattrem hatterene salandit salazzle pawniard bisharp throh sawk koffing weezing bonsly sudowoodo cleffa clefairy clefable togepi togetic togekiss munchlax snorlax cottonee whimsicott rhyhorn rhydon rhyperior gothita gothorita gothitelle solosis duosion reuniclus karrablast escavalier shelmet accelgor elgyem beheeyem cubchoo beartic rufflet braviary vullaby mandibuzz skorupi drapion litwick lampent chandelure inkay malamar sneasel weavile sableye mawile maractus sigilyph riolu lucario torkoal mimikyu cufant copperajah qwilfish frillish jellicent mareanie toxapex cramorant toxel toxtricity silicobra sandaconda hippopotas hippowdon durant heatmor helioptile heliolisk hawlucha trapinch vibrava flygon axew fraxure haxorus yamask runerigus cofagrigus honedge doublade aegislash ponyta rapidash sinistea polteageist indeedee phantump trevenant morelull shiinotic oranguru passimian morpeko falinks drampa turtonator togedemaru snom frosmoth clobbopus grapploct pincurchin mantyke mantine wailmer wailord bergmite avalugg dhelmise lapras lunatone solrock mime-jr mr-mime mr-rime darumaka darmanitan stonjourner eiscue duraludon rotom ditto dracozolt arctozolt dracovish arctovish charmander charmeleon charizard type-null silvally larvitar pupitar tyranitar deino zweilous hydreigon goomy sliggoo goodra jangmo-o hakamo-o kommo-o dreepy drakloak dragapult zacian zamazenta eternatus slowpoke slowbro slowking buneary lopunny happiny chansey blissey igglybuff jigglypuff wigglytuff fomantis lurantis fletchling fletchinder talonflame shinx luxio luxray klefki abra kadabra alakazam tentacool tentacruel dunsparce bouffalant lickitung lickilicky druddigon bulbasaur ivysaur venusaur squirtle wartortle blastoise venipede whirlipede scolipede foongus amoonguss comfey tangela tangrowth zorua zoroark staryu starmie kubfu urshifu emolga dedenne magnemite magneton magnezone carvanha sharpedo lillipup herdier stoutland tauros miltank scyther scizor pinsir heracross sandygast palossand azurill marill azumarill poliwag poliwhirl poliwrath politoed psyduck golduck whismur loudred exploud skarmory rockruff lycanroc mienfoo mienshao sandshrew sandslash cubone marowak kangaskhan sandile krokorok krookodile larvesta volcarona skrelp dragalge clauncher clawitzer horsea seadra kingdra petilil lilligant exeggcute exeggutor porygon porygon2 porygon-z zarude smoochum jynx elekid electabuzz electivire magby magmar magmortar audino cryogonal swablu altaria spiritomb nidoran-f nidorina nidoqueen nidoran-m nidorino nidoking tyrunt tyrantrum amaura aurorus absol bagon shelgon salamence gible gabite garchomp omanyte omastar kabuto kabutops aerodactyl carbink beldum metang metagross zubat golbat crobat tirtouga carracosta archen archeops spheal sealeo walrein lileep cradily anorith armaldo relicanth aron lairon aggron dratini dragonair dragonite regirock regice registeel regieleki regidrago articuno zapdos moltres cobalion terrakion virizion glastrier spectrier calyrex",
    19: "rowlet dartrix decidueye cyndaquil quilava typhlosion oshawott dewott samurott bidoof bibarel starly staravia staraptor shinx luxio luxray wurmple silcoon beautifly cascoon dustox ponyta rapidash eevee vaporeon jolteon flareon espeon umbreon leafeon glaceon sylveon zubat golbat crobat drifloon drifblim kricketot kricketune buizel floatzel burmy wormadam mothim geodude graveler golem stantler wyrdeer munchlax snorlax paras parasect pichu pikachu raichu abra kadabra alakazam chimchar monferno infernape buneary lopunny cherubi cherrim psyduck golduck combee vespiquen scyther kleavor scizor heracross mime-jr mr-mime aipom ambipom magikarp gyarados shellos gastrodon qwilfish overqwil happiny chansey blissey budew roselia roserade carnivine petilil lilligant tangela tangrowth barboach whiscash croagunk toxicroak ralts kirlia gardevoir gallade yanma yanmega hippopotas hippowdon pachirisu stunky skuntank teddiursa ursaring ursaluna goomy sliggoo goodra onix steelix rhyhorn rhydon rhyperior bonsly sudowoodo lickitung lickilicky togepi togetic togekiss turtwig grotle torterra porygon porygon2 porygon-z gastly haunter gengar spiritomb murkrow honchkrow unown spheal sealeo walrein remoraid octillery skorupi drapion growlithe arcanine glameow purugly machop machoke machamp chatot duskull dusclops dusknoir piplup prinplup empoleon mantyke mantine basculin basculegion vulpix ninetales tentacool tentacruel finneon lumineon magby magmar magmortar magnemite magneton magnezone bronzor bronzong elekid electabuzz electivire gligar gliscor gible gabite garchomp nosepass probopass voltorb electrode rotom chingling chimecho misdreavus mismagius cleffa clefairy clefable sneasel sneasler weavile snorunt glalie froslass cranidos rampardos shieldon bastiodon swinub piloswine mamoswine bergmite avalugg snover abomasnow zorua zoroark rufflet braviary riolu lucario uxie mesprit azelf heatran regigigas cresselia tornadus thundurus landorus enamorus dialga palkia giratina arceus phione manaphy shaymin darkrai",
    20: "sprigatito floragato meowscarada fuecoco crocalor skeledirge quaxly quaxwell quaquaval lechonk oinkologne tarountula spidops nymble lokix hoppip skiploom jumpluff fletchling fletchinder talonflame pawmi pawmo pawmot houndour houndoom yungoos gumshoos skwovet greedent sunkern sunflora kricketot kricketune scatterbug spewpa vivillon combee vespiquen rookidee corvisquire corviknight happiny chansey blissey azurill marill azumarill surskit masquerain buizel floatzel wooper clodsire psyduck golduck chewtle drednaw igglybuff jigglypuff wigglytuff ralts kirlia gardevoir gallade drowzee hypno gastly haunter gengar tandemaus maushold pichu pikachu raichu fidough dachsbun slakoth vigoroth slaking bounsweet steenee tsareena smoliv dolliv arboliva bonsly sudowoodo rockruff lycanroc rolycoly carkol coalossal shinx luxio luxray starly staravia staraptor oricorio mareep flaaffy ampharos petilil lilligant shroomish breloom applin flapple appletun spoink grumpig squawkabilly misdreavus mismagius makuhita hariyama crabrawler crabominable salandit salazzle phanpy donphan cufant copperajah gible gabite garchomp nacli naclstack garganacl wingull pelipper magikarp gyarados arrokuda barraskewda basculin gulpin swalot meowth persian drifloon drifblim flabebe floette florges diglett dugtrio torkoal numel camerupt bronzor bronzong axew fraxure haxorus mankey primeape annihilape meditite medicham riolu lucario charcadet armarouge ceruledge barboach whiscash tadbulb bellibolt goomy sliggoo goodra croagunk toxicroak wattrel kilowattrel eevee vaporeon jolteon flareon espeon umbreon leafeon glaceon sylveon dunsparce dudunsparce deerling sawsbuck girafarig farigiraf grimer muk maschiff mabosstiff toxel toxtricity dedenne pachirisu shroodle grafaiai stantler foongus amoonguss voltorb electrode magnemite magneton magnezone ditto growlithe arcanine teddiursa ursaring zangoose seviper swablu altaria skiddo gogoat tauros litleo pyroar stunky skuntank zorua zoroark sneasel weavile murkrow honchkrow gothita gothorita gothitelle sinistea polteageist mimikyu klefki indeedee bramblin brambleghast toedscool toedscruel tropius fomantis lurantis klawf capsakid scovillain cacnea cacturne rellor rabsca venonat venomoth pineco forretress scyther scizor heracross flittle espathra hippopotas hippowdon sandile krokorok krookodile silicobra sandaconda mudbray mudsdale larvesta volcarona bagon shelgon salamence tinkatink tinkatuff tinkaton hatenna hattrem hatterene impidimp morgrem grimmsnarl wiglett wugtrio bombirdier finizen palafin varoom revavroom cyclizar orthworm sableye shuppet banette falinks hawlucha spiritomb noibat noivern dreepy drakloak dragapult glimmet glimmora rotom greavard houndstone oranguru passimian komala larvitar pupitar tyranitar stonjourner eiscue pincurchin sandygast palossand slowpoke slowbro slowking shellos gastrodon shellder cloyster qwilfish luvdisc finneon lumineon bruxish alomomola skrelp dragalge clauncher clawitzer tynamo eelektrik eelektross mareanie toxapex flamigo dratini dragonair dragonite snom frosmoth snover abomasnow delibird cubchoo beartic snorunt glalie froslass cryogonal cetoddle cetitan bergmite avalugg rufflet braviary pawniard bisharp kingambit deino zweilous hydreigon veluza dondozo tatsugiri great-tusk scream-tail brute-bonnet flutter-mane slither-wing sandy-shocks iron-treads iron-bundle iron-hands iron-jugulis iron-moth iron-thorns frigibax arctibax baxcalibur gimmighoul gholdengo wo-chien chien-pao ting-lu chi-yu roaring-moon iron-valiant koraidon miraidon spinarak ariados yanma yanmega quagsire poochyena mightyena volbeat illumise corphish crawdaunt sewaddle swadloon leavanny cutiefly ribombee ekans arbok bellsprout weepinbell victreebel sentret furret dipplin vulpix ninetales poliwag poliwhirl poliwrath politoed hoothoot noctowl aipom ambipom swinub piloswine mamoswine seedot nuzleaf shiftry phantump trevenant poltchageist sinistcha geodude graveler golem timburr gurdurr conkeldurr morpeko munchlax snorlax lotad lombre ludicolo nosepass probopass grubbin charjabug vikavolt sandshrew sandslash gligar gliscor vullaby mandibuzz jangmo-o hakamo-o kommo-o koffing weezing mienfoo mienshao duskull dusclops dusknoir chingling chimecho slugma magcargo litwick lampent chandelure cleffa clefairy clefable feebas milotic carbink ducklett swanna cramorant basculegion ursaluna okidogi munkidori fezandipiti ogerpon doduo dodrio exeggcute exeggutor rhyhorn rhydon rhyperior elekid electabuzz electivire magby magmar magmortar kleavor blitzle zebstrika smeargle milcery alcremie trapinch vibrava flygon pikipek trumbeak toucannon tentacool tentacruel horsea seadra kingdra cottonee whimsicott comfey oddish gloom vileplume bellossom chinchou lanturn inkay malamar dewpider araquanid tyrogue hitmonlee hitmonchan hitmontop drilbur excadrill espurr meowstic minior cranidos rampardos shieldon bastiodon minccino cinccino skarmory plusle minun scraggy scrafty golett golurk porygon porygon2 porygon-z joltik galvantula beldum metang metagross seel dewgong lapras overqwil solosis duosion reuniclus snubbull granbull duraludon archaludon hydrapple bulbasaur ivysaur venusaur charmander charmeleon charizard squirtle wartortle blastoise chikorita bayleef meganium cyndaquil quilava typhlosion totodile croconaw feraligatr treecko grovyle sceptile torchic combusken blaziken mudkip marshtomp swampert turtwig grotle torterra chimchar monferno infernape piplup prinplup empoleon snivy servine serperior tepig pignite emboar oshawott dewott samurott chespin quilladin chesnaught fennekin braixen delphox froakie frogadier greninja rowlet dartrix decidueye litten torracat incineroar popplio brionne primarina grookey thwackey rillaboom scorbunny raboot cinderace sobble drizzile inteleon gouging-fire raging-bolt iron-crown iron-boulder terapagos walking-wake iron-leaves pecharunt",
    21: "chikorita bayleef meganium tepig pignite emboar totodile croconaw feraligatr fletchling fletchinder talonflame bunnelby diggersby scatterbug spewpa vivillon weedle kakuna beedrill pidgey pidgeotto pidgeot mareep flaaffy ampharos patrat watchog budew roselia roserade magikarp gyarados binacle barbaracle staryu starmie flabebe floette florges skiddo gogoat espurr meowstic litleo pyroar pancham pangoro trubbish garbodor dedenne pichu pikachu raichu cleffa clefairy clefable spinarak ariados ekans arbok abra kadabra alakazam gastly haunter gengar venipede whirlipede scolipede honedge doublade aegislash bellsprout weepinbell victreebel pansage simisage pansear simisear panpour simipour meditite medicham electrike manectric ralts kirlia gardevoir gallade houndour houndoom swablu altaria audino spritzee aromatisse swirlix slurpuff eevee vaporeon jolteon flareon espeon umbreon leafeon glaceon sylveon buneary lopunny shuppet banette vanillite vanillish vanilluxe numel camerupt hippopotas hippowdon drilbur excadrill sandile krokorok krookodile machop machoke machamp gible gabite garchomp carbink sableye mawile absol riolu lucario slowpoke slowbro slowking carvanha sharpedo tynamo eelektrik eelektross dratini dragonair dragonite bulbasaur ivysaur venusaur charmander charmeleon charizard squirtle wartortle blastoise stunfisk furfrou inkay malamar skrelp dragalge clauncher clawitzer goomy sliggoo goodra delibird snorunt glalie froslass snover abomasnow bergmite avalugg scyther scizor pinsir heracross emolga hawlucha phantump trevenant scraggy scrafty noibat noivern klefki litwick lampent chandelure aerodactyl tyrunt tyrantrum amaura aurorus onix steelix aron lairon aggron helioptile heliolisk pumpkaboo gourgeist larvitar pupitar tyranitar froakie frogadier greninja falinks chespin quilladin chesnaught skarmory fennekin braixen delphox bagon shelgon salamence kangaskhan drampa beldum metang metagross xerneas yveltal zygarde diancie mewtwo mankey primeape annihilape meowth persian perrserker farfetchd sirfetchd cubone marowak porygon porygon2 porygon-z capsakid scovillain tinkatink tinkatuff tinkaton cyclizar glimmet glimmora rotom greavard houndstone sandygast palossand kecleon flamigo cryogonal dondozo tatsugiri frigibax arctibax baxcalibur gimmighoul gholdengo qwilfish overqwil treecko grovyle sceptile torchic combusken blaziken mudkip marshtomp swampert feebas milotic chingling chimecho indeedee purrloin liepard munna musharna throh sawk yamask cofagrigus runerigus wimpod golisopod nickit thievul clobbopus grapploct mimikyu kleavor morpeko golett golurk rookidee corvisquire corviknight igglybuff jigglypuff wigglytuff fidough dachsbun starly staravia staraptor spoink grumpig squawkabilly crabrawler crabominable nacli naclstack garganacl gulpin swalot zubat golbat crobat charcadet armarouge ceruledge maschiff mabosstiff toxel toxtricity shroodle grafaiai zangoose seviper mime-jr mr-mime mr-rime foongus amoonguss heatran volcanion cobalion terrakion virizion keldeo meloetta genesect hoopa marshadow meltan melmetal darkrai latias latios kyogre groudon rayquaza magearna zeraora",
  };
  for (const g in DEX)
    DEX[g].split(" ").forEach((s) => {
      if (BY_SLUG[s]) add(BY_SLUG[s], +g);
    });

  /* Pokémon que se obtienen en el juego (o con su DLC) pero no salen en ninguna Pokédex regional */
  const FUERA = {
    /* Sol/Luna: Escaneo Isla (serebii.net/sunmoon/qrscanner.shtml) y eventos (Magearna por código QR, Marshadow) */
    14: [
      "Horsea",
      "Chikorita",
      "Cyndaquil",
      "Totodile",
      "Klink",
      "Litwick",
      "Deino",
      "Bellsprout",
      "Marill",
      "Spheal",
      "Luxio",
      "Venipede",
      "Gothita",
      "Honedge",
      "Rhyhorn",
      "Swinub",
      "Vigoroth",
      "Roselia",
      "Staravia",
      "Duosion",
      "Axew",
      "Togekiss",
      "Serperior",
      "Emboar",
      "Samurott",
      "Conkeldurr",
      "Leavanny",
      "Eelektross",
      "Magearna",
      "Marshadow",
    ],
    /* USUL: legendarios de los Ultraumbrales (serebii.net/ultrasunultramoon/ultrawormholes.shtml),
       Escaneo Isla (serebii.net/ultrasunultramoon/islandscan.shtml) y eventos (Magearna, Marshadow, Zeraora) */
    15: [
      "Articuno",
      "Zapdos",
      "Moltres",
      "Mewtwo",
      "Raikou",
      "Entei",
      "Suicune",
      "Lugia",
      "Ho-Oh",
      "Regirock",
      "Regice",
      "Registeel",
      "Latias",
      "Latios",
      "Kyogre",
      "Groudon",
      "Rayquaza",
      "Uxie",
      "Mesprit",
      "Azelf",
      "Dialga",
      "Palkia",
      "Heatran",
      "Regigigas",
      "Giratina",
      "Cresselia",
      "Cobalion",
      "Terrakion",
      "Virizion",
      "Tornadus",
      "Thundurus",
      "Landorus",
      "Reshiram",
      "Zekrom",
      "Kyurem",
      "Xerneas",
      "Yveltal",
      "Bulbasaur",
      "Charmander",
      "Squirtle",
      "Beedrill",
      "Pidgeot",
      "Onix",
      "Rhyhorn",
      "Horsea",
      "Swinub",
      "Grovyle",
      "Combusken",
      "Marshtomp",
      "Ralts",
      "Aggron",
      "Spheal",
      "Grotle",
      "Monferno",
      "Prinplup",
      "Rotom",
      "Leavanny",
      "Eelektross",
      "Litwick",
      "Axew",
      "Chesnaught",
      "Delphox",
      "Greninja",
      "Scatterbug",
      "Honedge",
      "Magearna",
      "Marshadow",
      "Zeraora",
    ],
    /* Espada/Escudo con DLC: Aventuras Dinamax, regalos de Las Nieves de la Corona y "otros disponibles"
       (serebii.net/swordshield/pokemonnotindex.shtml, ign.com Crown Tundra). Eventos: Mew (Poké Ball Plus), Zarude (código) */
    17: [
      "Mewtwo",
      "Raikou",
      "Entei",
      "Suicune",
      "Lugia",
      "Ho-Oh",
      "Latias",
      "Latios",
      "Kyogre",
      "Groudon",
      "Rayquaza",
      "Uxie",
      "Mesprit",
      "Azelf",
      "Dialga",
      "Palkia",
      "Heatran",
      "Giratina",
      "Cresselia",
      "Regigigas",
      "Tornadus",
      "Thundurus",
      "Landorus",
      "Reshiram",
      "Zekrom",
      "Kyurem",
      "Keldeo",
      "Xerneas",
      "Yveltal",
      "Zygarde",
      "Tapu Koko",
      "Tapu Lele",
      "Tapu Bulu",
      "Tapu Fini",
      "Cosmog",
      "Cosmoem",
      "Solgaleo",
      "Lunala",
      "Necrozma",
      "Nihilego",
      "Buzzwole",
      "Pheromosa",
      "Xurkitree",
      "Celesteela",
      "Kartana",
      "Guzzlord",
      "Stakataka",
      "Blacephalon",
      "Poipole",
      "Naganadel",
      "Treecko",
      "Grovyle",
      "Sceptile",
      "Torchic",
      "Combusken",
      "Blaziken",
      "Mudkip",
      "Marshtomp",
      "Swampert",
      "Rowlet",
      "Dartrix",
      "Decidueye",
      "Litten",
      "Torracat",
      "Incineroar",
      "Popplio",
      "Brionne",
      "Primarina",
      "Mew",
      "Zarude",
    ],
    /* Escarlata/Púrpura con DLC: legendarios de Snacksworth en El Disco Índigo y otros fuera de la Pokédex
       (serebii.net/scarletviolet/pokemonnotindex.shtml). Evento: Mewtwo en Teraincursión de 7 estrellas */
    20: [
      "Articuno",
      "Zapdos",
      "Moltres",
      "Raikou",
      "Entei",
      "Suicune",
      "Lugia",
      "Ho-Oh",
      "Latias",
      "Latios",
      "Kyogre",
      "Groudon",
      "Rayquaza",
      "Cobalion",
      "Terrakion",
      "Virizion",
      "Reshiram",
      "Zekrom",
      "Kyurem",
      "Meloetta",
      "Solgaleo",
      "Lunala",
      "Necrozma",
      "Perrserker",
      "Kubfu",
      "Urshifu",
      "Glastrier",
      "Spectrier",
      "Mewtwo",
    ],
  };
  for (const g in FUERA) FUERA[g].forEach((n) => add(n, +g));

  /* Correcciones sueltas: "Nombre": [índices de juego] */
  const EXTRA = {};
  for (const n in EXTRA) EXTRA[n].forEach((i) => add(n, i));
})(window.DATA);
