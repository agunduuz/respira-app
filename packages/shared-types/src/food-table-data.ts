/**
 * OTOMATİK ÜRETİLDİ — elle düzenlemeyin.
 *
 * Kaynaklar (bkz. FOOD_TABLE_SOURCES, food-table.ts):
 *  - TürKomp, Ulusal Gıda Kompozisyon Veritabanı (laboratuvar analizli)
 *  - Doğrulanmış Türk yemekleri tablosu (malzeme bazlı hesap)
 *
 * Satır biçimi (boru ile ayrık, boş alan = bilinmiyor):
 *   id|ad|kcal|protein|karbonhidrat|yağ|lif|gramPerAdet|gramPerMl
 *
 * Neden nesne dizisi değil de tek bir metin? 1074 kayıt nesne olarak
 * yazıldığında mobil paket ~2 kat büyüyor ve her açılışta o kadar JS ayrıştırılıyor.
 * Tek metni bir kez `split` etmek hem küçük hem hızlı.
 */

export const FOOD_ROWS = `turkomp_700|Ayran, tam yağlı|37|1.98|2.71|2|||1.03
turkomp_750|Eritme Peyniri, sade, tam yağlı|265|12.95|1.54|23|||
turkomp_5|Kaymak, pastörize (süt yağı ≥ % 60)|585|0.96|3.31|63.1|0||
turkomp_7|Peynir, beyaz, az yağlı-yağsız (yağ, kuru maddede < % 20)|185|16.52|12.37|7.76|0||
turkomp_8|Peynir, beyaz, tam yağlı (yağ, kuru maddede > % 45)|309|16.01|8.21|23.55|0||
turkomp_9|Peynir, beyaz, yarım yağlı (yağ, kuru maddede > % 20)|202|15.57|12.18|10.12|0||
turkomp_11|Peynir, kaşar, olgunlaştırılmamış (taze)|353|26.99|2.56|26.06|0||
turkomp_12|Peynir, kaşar, olgunlaştırılmış (eski)|381|26.03|3.14|29.4|0||
turkomp_13|Peynir, keçi|279|17.86|7.69|19.64|0||
turkomp_14|Peynir, koyun|269|18.76|7.87|18.08|0||
turkomp_24|Süt tozu, yağsız (100 g kuru maddede en çok 1.5 g süt yağı)|361|34.83|53.43|0.86|0||
turkomp_17|Süt, inek|64|3.17|4.78|3.57|||1.03
turkomp_18|Süt, inek, UHT, tam yağlı (100 ml' de 3 g süt yağı)|58|2.82|5.57|2.77|0||1.03
turkomp_20|Süt, inek, UHT, yağsız (100 ml' de 1.5 g' dan az süt yağı)|34|2.81|5.52|0.11|0||1.03
turkomp_19|Süt, inek, UHT, yarım yağlı (100 ml' de 1.5 g süt yağı)|47|2.93|5.43|1.52|0||1.03
turkomp_693|Süt, insan, erişkin|68|0.7|6.8|4.18|0||1.03
turkomp_21|Süt, keçi|71|3.55|4.4|4.32|||1.03
turkomp_22|Süt, koyun|89|5.49|4.51|5.4|||1.03
turkomp_23|Süt, manda|119|4.05|5|9.25|||1.03
turkomp_16|Süt, pastörize, tam yağlı (100 ml' de 3 g süt yağı)|61|3.32|5.09|3.04|0||1.03
turkomp_1|Sütlü buz, vanilya aromalı|144|3.76|22.21|4.44|0||
turkomp_25|Tereyağı, kahvaltılık, pastörize (süt yağı ≥ % 82)|753|0.19|0.85|83.22|||
turkomp_749|Yoğurt, çilekli, tam yağlı|99|2.49|14.26|3.41|0.6||
turkomp_4|Yoğurt, homojenize, tam yağlı (süt yağı ≥ % 3.8)|69|4.53|4.24|3.8|||
turkomp_3|Yoğurt, homojenize, yarım yağlı (% 2 > süt yağı ≥ % 1.5)|49|4.27|3.91|1.76|0||
turkomp_2|Yoğurt, kaymaklı|77|4.91|2.93|5.02|0||
turkomp_6|Yoğurt, manda sütü|112|4.82|4.65|8.21|||
turkomp_33|Yumurta, beyaz, pastörize|133|10.38|0|10.16|||
turkomp_29|Yumurta, bıldırcın, tam|171|13.38|0|13.04|||
turkomp_30|Yumurta, devekuşu, tam|126|10.82|0|9.17|||
turkomp_34|Yumurta, sarı, pastörize|294|16.61|0|25.24|||
turkomp_28|Yumurta, tavuk, beyaz (ak)|45|11.18|0|0.01|||
turkomp_27|Yumurta, tavuk, sarı|308|14.75|0|27.62|||
turkomp_26|Yumurta, tavuk, tam|140|13.13|0|9.69|||
turkomp_518|Afyon pastırması|209|30.63|10.4|4.38|2.57||
turkomp_67|Bıldırcın eti, derisiz|127|21.46|0|4.57|||
turkomp_41|Dana eti, bonfile|149|20.81|0|7.27|||
turkomp_45|Dana eti, but|125|20.99|0|4.59|||
turkomp_44|Dana eti, kol|135|20.86|0|5.73|||
turkomp_42|Dana eti, kontrfile|147|20.08|0|7.38|||
turkomp_43|Dana eti, pirzola|139|20.15|0|6.53|||
turkomp_59|Devekuşu eti, but|115|20.26|0|3.78|||
turkomp_58|Devekuşu eti, göğüs|115|18.04|0|4.8|||
turkomp_77|Döner, kıyma, çiğ|309|18.58|0|26.12|||
turkomp_78|Döner, piliç eti, çiğ|167|23.87|0|8|||
turkomp_765|Emülsifiye Et ürünü, sosis, dana|174|11.19|2.92|11.66|6.4||
turkomp_742|Emülsifiye Et ürünü, sosis, Hindi|207|11.13|2.57|15.66|5.8||
turkomp_740|Emülsifiye Et ürünü, sosis, Piliç|208|11.31|3.04|15.22|6.8||
turkomp_697|Emülsifiye et ürünü, salam, dana|180|10.5|4.81|12.28|4.2||
turkomp_745|Emülsifiye et ürünü, salam, hindi|192|12.5|2.6|13.69|4||
turkomp_743|Emülsifiye et ürünü, salam, piliç|210|11.44|1.39|16.03|7.2||
turkomp_63|Hindi eti, but, derisiz|123|20.64|0|4.45|||
turkomp_62|Hindi eti, göğüs fileto, derisiz|116|21.27|0|3.46|||
turkomp_741|Isıl işlem görmüş sucuk, dana|395|15.81|2.12|35.06|3.7||
turkomp_744|Isıl işlem görmüş sucuk, Hindi|367|14.56|0.3|32.77|6.2||
turkomp_764|Isıl işlem görmüş sucuk, piliç|353|13.96|3.86|30.24|4.77||
turkomp_762|Jambon, dana|111|13.81|4.16|3.52|3.5||
turkomp_763|Jambon, piliç|120|13.94|4.26|4.53|3||
turkomp_746|Kasap köfte, dana, çiğ|193|14.13|4.36|12.04|5.5||
turkomp_474|Kayseri pastırması|252|28.56|6.55|11.97|2.05||
turkomp_521|Kayseri sucuğu|431|20.38|9.54|34.36|1.01||
turkomp_61|Kaz eti, but, derisiz, tuz ilaveli|173|18.85|0|10.82|||
turkomp_60|Kaz eti, göğüs, derisiz, tuz ilaveli|200|18.68|0|13.91|||
turkomp_542|Keçi eti, bel|198|19.72|0|13.23|||
turkomp_55|Keçi eti, but|163|20.05|0|9.24|||
turkomp_54|Keçi eti, kol|174|20.43|0|10.27|||
turkomp_56|Keçi eti, sırt|189|20.53|0|11.91|||
turkomp_48|Koyun eti, bel|142|20.61|0|6.64|||
turkomp_47|Koyun eti, but|137|18.02|0|7.2|||
turkomp_46|Koyun eti, kol|122|18.81|0|5.17|||
turkomp_49|Koyun eti, sırt|138|18.21|0|7.28|||
turkomp_80|Koyun, kuyruk yağı|787|2.87|0|86.12|||
turkomp_52|Kuzu eti, bel|140|18.47|0|7.29|||
turkomp_51|Kuzu eti, but|122|19.3|0|4.95|||
turkomp_50|Kuzu eti, kol|120|18.74|0|4.97|||
turkomp_53|Kuzu eti, sırt|136|17.72|0|7.29|||
turkomp_65|Piliç eti, but|212|24.04|0|12.82|||
turkomp_64|Piliç eti, göğüs, derisiz|121|21.7|0|3.78|||
turkomp_66|Piliç eti, kanat|173|20.3|0|10.15|||
turkomp_36|Sığır eti, bonfile|136|19.88|0|6.27|||
turkomp_40|Sığır eti, but|123|20.39|0|4.63|||
turkomp_39|Sığır eti, kol|131|21.25|0|5.07|||
turkomp_37|Sığır eti, kontrfile|123|19.21|0|5.13|||
turkomp_38|Sığır eti, pirzola|156|19.56|0|8.68|||
turkomp_479|Sucuk, Erzurum|454|23.75|2.17|38.52|1.81||
turkomp_57|Tavşan eti, derisiz|162|21.13|0|8.65|||
turkomp_71|Yenilebilir sakatat, dana karaciğer|141|21.39|0|6.2|||
turkomp_76|Yenilebilir sakatat, dana akciğer|104|16.72|0|4.07|||
turkomp_69|Yenilebilir sakatat, dana beyin|120|12.05|0|8|||
turkomp_74|Yenilebilir sakatat, dana böbrek|125|15.15|0|7.1|||
turkomp_73|Yenilebilir sakatat, dana dalak|104|17.1|0|3.98|||
turkomp_70|Yenilebilir sakatat, dana dil|135|19.84|0|6.22|||
turkomp_72|Yenilebilir sakatat, dana işkembe|108|12.75|0|6.36|||
turkomp_75|Yenilebilir sakatat, dana kalp|100|18.29|0|2.96|||
turkomp_543|Yenilebilir sakatat, koyun bağırsak|392|7.66|0|40.11|||
turkomp_513|Alabalık, Gökkuşağı, yetiştirme|121|18.78|0|5.12|||
turkomp_91|Barbunya (barbun)|148|17.13|0|8.87|||
turkomp_89|Berlam|78|17.76|0|0.82|||
turkomp_511|Çipura, yetiştirme|130|19.06|0|5.98|||
turkomp_81|Hamsi|197|16.95|0|14.36|||
turkomp_512|Hamsi, konserve, ayçiçek yağında|163|18.88|0|9.74|||
turkomp_83|İstavrit|156|18.62|0|9.08|||
turkomp_96|Kalkan|91|16.44|0|2.76|||
turkomp_94|Karides, derin su pembe|78|18.08|0|0.67|||
turkomp_93|Kefal, pasifik (Rus kefali)|81|18.53|0|0.73|||
turkomp_92|Kefal, sarı kulak|104|19.03|0|3.07|||
turkomp_85|Levrek, yetiştirme|128|19.48|0|5.55|||
turkomp_88|Lüfer|215|17.6|0|16.11|||
turkomp_90|Mezgit|70|15.27|0|0.97|||
turkomp_95|Midye, Akdeniz, kara midye|66|13.09|0|1.53|||
turkomp_84|Palamut|216|20.16|0|15.07|||
turkomp_100|Sardalya, konserve, ayçiçek yağında|175|20.69|0|10.22|||
turkomp_98|Tirsi|205|16.13|0|16.4|||
turkomp_99|Ton balığı, konserve, ayçiçek yağında|173|20.81|0|10.02|||
turkomp_97|Zargana|125|20.24|0|4.93|||
turkomp_101|Ayçiçek yağı|900|0|0|100|0||
turkomp_106|Fındık yağı|900|0|0|100|0||
turkomp_107|Kanola yağı|900|0|0|100|0||
turkomp_109|Margarin, az yağlı (% 39-41 yağ)|371|0|0.51|41|0||
turkomp_605|Margarin, sürülebilir, kahvaltılık|553|0|1.14|60.9|0||
turkomp_110|Margarin, yemeklik|627|0|0|69.66|0||
turkomp_108|Mısır yağı|900|0|0|100|0||
turkomp_105|Zeytinyağı, rafine|900|0|0|100|0||
turkomp_104|Zeytinyağı, riviera|900|0|0|100|0||
turkomp_103|Zeytinyağı, sızma|900|0|0|100|0||
turkomp_113|Arpa unu|322|8.22|61.49|1.56|14.39||
turkomp_112|Arpa, altı sıralı|319|9.63|55.08|1.97|21.11||
turkomp_111|Arpa, iki sıralı|319|9.75|55.29|1.8|21.09||
turkomp_114|Bisküvi, bebe|459|4.1|70.21|17.19|3.48||
turkomp_115|Bisküvi, tatlı (petit beure)|432|5.59|74.51|11.64|3.44||
turkomp_753|Börek, ıspanaklı, dondurulmuş|280|4.85|32.26|13.83|3.4||
turkomp_752|Börek, peynirli, dondurulmuş|288|6.73|32.34|13.87|3.3||
turkomp_120|Buğday kepeği|315|14.26|34.02|6.03|33.75||
turkomp_121|Buğday nişastası|353|0.17|86.98|0|2.03||
turkomp_122|Buğday ruşeymi|369|29.64|31.65|10.2|15.98||
turkomp_755|Buğday, aşurelik|332|11.54|61.51|1.3|13.8||
turkomp_118|Buğday, ekmeklik|335|11.3|62.48|1.64|12.66||
turkomp_119|Buğday, makarnalık|344|12.13|65.35|1.57|9.83||
turkomp_731|Buğday, siyez|331|9.46|62.81|2.15|11.3||
turkomp_129|Buğday, un, ekmeklik, tip 550 (kül, kuru maddede ≤ % 0.55)|350|10.66|71.76|1.44|3.76||
turkomp_130|Buğday, un, ekmeklik, tip 650 (kül, kuru maddede ≤ % 0.65)|353|8.84|73.92|1.62|3.62||
turkomp_131|Buğday, un, ekmeklik, tip 850 (kül, kuru maddede ≤ % 0.85)|349|7.58|74.05|1.58|4.32||
turkomp_460|Bulgur, pilavlık, Gaziantep|357|12.08|64.97|3.95|6.79||
turkomp_123|Çavdar|324|7.68|61.99|1.54|15.59||
turkomp_125|Çavdar unu|335|10.61|63.36|2.14|9.68||
turkomp_126|Ekmek, beyaz|276|9.41|50.13|3.22|4.32||
turkomp_124|Ekmek, çavdar|254|10.01|44.45|2.79|5.39||
turkomp_127|Ekmek, kepekli|246|10.47|38.61|3.4|9.32||
turkomp_139|Ekmek, mısır|250|5.01|51.38|1.58|4.91||
turkomp_128|Ekmek, tam buğday unlu|258|10.79|43.66|3.35|4.86||
turkomp_150|Ekmek, yulaf|259|10.14|42.86|4.12|4.76||
turkomp_665|Galeta, sade|390|10.21|74.94|4.79|3.2||
turkomp_606|İrmik, buğday|344|8.66|71.24|1.71|4.57||
turkomp_679|Katmer, sade|373|5.66|50.33|15.59|4.21||
turkomp_754|Kek, kakaolu|410|5.47|55.84|18.1|0.9||
turkomp_154|Koca darı, sorgum|345|10.29|59.88|4.21|13.17||
turkomp_117|Kraker, tuzlu|410|7.24|73.45|8.67|4.7||
turkomp_132|Makarna, sade, yumurtasız, kuru|356|8.44|74.36|1.85|4.21||
turkomp_516|Maraş tarhanası|348|13|66.5|2.24|5.06||
turkomp_751|Milföy hamuru, dondurulmuş|367|5.71|40.11|19.9|2.3||
turkomp_133|Mısır çerezi|411|5.13|82.8|6.12|2.19||
turkomp_143|Mısır gevreği|371|5.94|82.94|0.88|3.93||
turkomp_141|Mısır nişastası|370|0.19|90.58|0.78|||
turkomp_142|Mısır unu|356|5.44|72.85|3.66|5.06||
turkomp_135|Mısır, at dişi, kuru|339|8.51|58.56|4.76|14||
turkomp_137|Mısır, cin, kuru|348|9.89|60.56|4.72|12.04||
turkomp_138|Mısır, şeker, kuru|340|9.81|57.16|4.67|15.16||
turkomp_136|Mısır, sert, kuru|339|9.7|55.41|5.41|14.83||
turkomp_146|Pirinç unu|346|6.72|74.84|1.2|4.34||
turkomp_144|Pirinç, Osmancık|341|6.84|75.67|0.44|3.46||
turkomp_581|Ramazan pidesi|258|7.58|51.39|1.5|4.08||
turkomp_484|Tarhana, kuru, Beypazarı, Ankara|317|14.38|54.92|3.06|6.15||
turkomp_515|Tarhana, kuru, Gediz, Kütahya|343|12.56|65.38|2.59|3.85||
turkomp_514|Tarhana, kuru, Uşak|336|12.11|65.33|2.11|3.84||
turkomp_155|Tritikale|341|12.05|63.13|1.98|11.38||
turkomp_690|Yufka, böreklik, çiğ|242|6.84|50.11|0.88|3.1||
turkomp_680|Yufka, pişmiş|314|7.47|66.94|1.06|3.4||
turkomp_151|Yulaf kepeği|347|12.88|56.51|5.26|10.82||
turkomp_152|Yulaf unu|353|9.62|54.19|7.76|13.84||
turkomp_148|Yulaf, beyaz|351|11.35|57.27|5.8|12.24||
turkomp_149|Yulaf, kırmızı|348|13.37|54.99|4.96|15.01||
turkomp_167|Ayçiçeği tohumu, çerezlik, Alaca, kavrulmuş|637|24.75|16.24|52.02|2.48||
turkomp_166|Çam fıstığı, kuru|675|11.82|2.87|66.66|7.95||
turkomp_162|Haşhaş tohumu, kuru|487|17.14|6.52|37.63|26.87||
turkomp_165|Keten tohumu, kuru|454|18.07|3.44|33.11|35.06||
turkomp_164|Kolza tohumu, kuru|501|18.67|16.36|35.72|19.67||
turkomp_156|Mercimek, kırmızı, kuru|322|25.81|41.94|1.57|18.67||
turkomp_157|Mercimek, yeşil, kuru|299|23|36.62|0.92|25.99||
turkomp_158|Nohut, Koçbaşı, kuru|334|18.56|41.35|5.33|23.03||
turkomp_163|Susam tohumu, kuru|576|16.81|2.01|51.2|19.88||
turkomp_161|Yer fıstığı, kuru|570|23.51|10.49|45.42|12.54||
turkomp_204|Acur|22|0.65|3.03|0.47|1.45||
turkomp_723|Ak sirken|20|0.98|2.25|0.35|2.21||
turkomp_708|Alagömeç|24|1.58|0.84|0.31|5.71||
turkomp_216|Bakla|47|3.61|4.36|0.98|3.36||
turkomp_217|Bakla, kuru|323|23.07|46.66|1.6|14.71||
turkomp_221|Bamya|48|2.9|7.2|0.13|3.36||
turkomp_224|Bamya, dondurulmuş|30|2.88|2.48|0.28|3.21||
turkomp_222|Bamya, konserve|33|3.56|2.72|0.2|3.23||
turkomp_223|Bamya, kuru|250|12.77|26.93|1.23|40.06||
turkomp_510|Barbunya fasulyesi, konserve|110|7.19|15.74|0.33|7.53||
turkomp_211|Barbunya fasulyesi, kuru|299|21.07|38.8|1.46|23.21||
turkomp_212|Bezelye|92|6.49|12.22|0.82|5.11||
turkomp_213|Bezelye, dondurulmuş|71|6.38|8.61|0.42|3.49||
turkomp_214|Bezelye, konserve|55|6.21|2.52|0.31|8.86||
turkomp_215|Bezelye, kuru|309|19.82|42.98|1.15|23.65||
turkomp_181|Biber salçası|112|2.44|23.43|0.44|2.49||
turkomp_176|Biber, Çarliston tipi|22|0.82|3.43|0.16|1.98||
turkomp_175|Biber, dolma|23|0.68|4.23|0.11|1.29||
turkomp_184|Biber, kırmızı, acılı, pul|286|11.69|43.67|17.3|32.25||
turkomp_177|Biber, kırmızı, California Wonder tipi|28|0.89|4.94|0.21|1.61||
turkomp_185|Biber, kırmızı, dolmalık, kuru|303|9.13|47.16|3.25|24.27||
turkomp_183|Biber, kırmızı, toz|281|14.75|32.97|12.9|45.05||
turkomp_182|Biber, közlenmiş, konserve|38|0.63|8.02|0.11|1.02||
turkomp_178|Biber, sarı, California Wonder tipi|26|0.79|4.21|0.21|1.86||
turkomp_174|Biber, sivri|28|0.76|4.85|0.13|1.93||
turkomp_179|Biber, süs, turşuluk|44|1.78|6.11|0.55|3.96||
turkomp_218|Börülce|49|3.67|6.25|0.25|3.55||
turkomp_220|Börülce, konserve|114|2.5|23.29|0.34|3.91||
turkomp_219|Börülce, kuru|313|22.88|43.74|1.01|18.98||
turkomp_249|Brokoli|39|3.03|4.3|0.35|3.42||
turkomp_729|Çağ, kök|177|3.63|14.56|2.1|42.71||
turkomp_735|Çıntar mantarı|23|0.17|2.92|0.32|4.05||
turkomp_706|Çiriş|26|0|4.06|0.46|2.75||
turkomp_707|Çoban çantası|28|2.66|3.17|0.18|1.36||
turkomp_730|Çöven, kök|319|6.63|68.49|0.54|6.89||
turkomp_709|Deli kereviz|28|0.66|3.37|0.12|5.17||
turkomp_714|Deli maydanoz|21|1.14|2.07|0.37|2.21||
turkomp_710|Deniz börülcesi|36|0.86|5.82|0.49|2.63||
turkomp_255|Dereotu|46|2.95|5.27|0.97|1.98||
turkomp_722|Dikenucu|51|3.93|3.88|0.41|8.17||
turkomp_720|Dolambaç|28|1.38|1.32|0.43|6.5||
turkomp_170|Domates salçası|97|4.56|16.64|0.52|3.58||
turkomp_172|Domates suyu|15|0.75|2.11|0.08|1.36||1.05
turkomp_171|Domates, doğranmış, konserve|15|0.88|1.77|0.22|1.45||
turkomp_173|Domates, kuru|210|11.31|29.22|0.53|21.65||
turkomp_168|Domates, sofralık|19|0.89|2.86|0.2|1.1||
turkomp_169|Domates, sofralık, kiraz|26|0.87|4.62|0.22|1.02||
turkomp_279|Ebegümeci|49|2.94|6.6|0.57|2.95||
turkomp_713|Ecibücü|29|0|4.52|0.48|3.42||
turkomp_241|Enginar|32|2.46|2.62|0.2|4.74||
turkomp_243|Enginar, dondurulmuş|25|1.81|0.16|0.38|6.89||
turkomp_242|Enginar, konserve|37|1.19|5.92|0.12|3.53||
turkomp_702|Eşek turpu|27|1.49|3.65|0.21|2.23||
turkomp_206|Fasulye|44|2.2|6.99|0.37|2.08||
turkomp_210|Fasulye, dermason, kuru|281|21.75|29.42|1.35|32.17||
turkomp_207|Fasulye, dondurulmuş|36|1.81|4.35|0.24|4.36||
turkomp_208|Fasulye, konserve|36|1.44|5.65|0.2|2.96||
turkomp_259|Havuç, siyah|42|0.87|8.01|0.14|2.48||
turkomp_258|Havuç, turuncu|37|0.89|6.5|0.2|2.58||
turkomp_718|Helevan|39|0|5.41|0.83|4.7||
turkomp_719|Hindiba|22|0.53|2.12|0.28|4.45||
turkomp_278|Isırgan|54|3.44|6.6|0.69|3.9||
turkomp_268|Ispanak|24|2.49|1.37|0.49|2.27||
turkomp_270|Ispanak, dondurulmuş|20|2.88|0.2|0.16|3.32||
turkomp_202|Kabak çekirdeği, kuru|619|28.89|10.74|49.96|5.26||
turkomp_200|Kabak, kışlık, balkabağı|41|0.46|8.72|0.2|1.16||
turkomp_201|Kabak, kışlık, kestane|32|0.84|5.97|0.2|1.62||
turkomp_199|Kabak, yazlık, koyu yeşil|17|0.5|2.28|0.28|1.73||
turkomp_198|Kabak, yazlık, sakız, açık yeşil|18|0.68|2.48|0.24|1.63||
turkomp_705|Kaldirik|24|0.43|2.34|0.13|5.7||
turkomp_716|Karakavuk|36|3.22|3.62|0.7|1.37||
turkomp_248|Karnabahar|29|1.61|3.71|0.32|2.32||
turkomp_190|Karpuz, çekirdekli|30|0.13|6.8|0.14|0.54||
turkomp_192|Karpuz, çekirdekli, Diyarbakır|34|0.16|7.44|0.23|0.61||
turkomp_191|Karpuz, çekirdeksiz|31|0.15|7.08|0.15|0.52||
turkomp_196|Kavun, kışlık Kırkağaç|31|0.28|6.72|0.21|0.65||
turkomp_195|Kavun, yazlık, çitili kavun, Kantalop|41|0.42|8.73|0.29|0.94||
turkomp_711|Kaya koruğu|26|0.31|2.48|0.39|5.7||
turkomp_703|Kaymacık|26|1.56|1.89|0.31|4.65||
turkomp_712|Keçi ayağı|22|1.04|1.08|0.37|5.17||
turkomp_727|Kenger|26|1.15|3.45|0.13|3.37||
turkomp_265|Kereviz, kök|31|0.82|5|0.29|2.7||
turkomp_266|Kereviz, sap|29|0.94|3.7|0.22|4.28||
turkomp_704|Kıyı pancarı|27|2.42|1.26|0.18|5.27||
turkomp_236|Kuşkonmaz|39|1.19|7.43|0.1|1.8||
turkomp_237|Kuşkonmaz, konserve|19|1|2.59|0.12|1.55||
turkomp_726|Kuzukemirdi|42|1.94|1.36|0.86|10.76||
turkomp_724|Labada|25|1.85|1.06|0.36|5.05||
turkomp_244|Lahana, beyaz, baş|26|0.86|4.19|0.2|2.1||
turkomp_250|Lahana, Brüksel|44|2.97|5.02|0.3|4.5||
turkomp_246|Lahana, kara|51|0.45|10.27|0.39|2.14||
turkomp_245|Lahana, kırmızı, baş|36|0.52|6.99|0.21|1.96||
turkomp_725|Madımak|60|2.06|6.78|0.65|9.52||
turkomp_276|Mantar, beyaz şapkalı|24|1.5|2.59|0.41|1.88||
turkomp_277|Mantar, beyaz şapkalı, konserve|49|2.06|9.28|0.32|0.2||
turkomp_240|Marul, baş salata, Iceberg|17|0.8|2.34|0.2|1.32||
turkomp_239|Marul, kıvırcık, salata|17|0.87|1.69|0.23|2.09||
turkomp_238|Marul, uzun yapraklı|16|0.76|2.25|0.21|1.19||
turkomp_263|Maydanoz|37|3.39|2.82|0.56|3.42||
turkomp_264|Maydanoz, kuru|252|20.91|20.37|3.39|28.07||
turkomp_225|Mısır, tatlı|135|3.47|28.25|0.37|2.19||
turkomp_227|Mısır, tatlı, dondurulmuş|91|3.19|16.51|0.18|5.35||
turkomp_140|Mısır, tatlı, konserve|63|2.63|11.37|0.44|1.78||
turkomp_274|Nane|41|3.37|1.6|0.88|6.69||
turkomp_275|Nane, kuru|289|21.19|25.02|4.14|33.24||
turkomp_756|Nohut, haşlanmış, konserve|106|5.31|16.01|0.98|6||
turkomp_272|Pancar, kırmızı|44|1.23|8.02|0.52|1.28||
turkomp_537|Pancar, kırmızı, yemeklik, Leyla|38|1.16|5.4|0.61|3.1||
turkomp_280|Pancar, şeker|82|0.51|18.54|0.15|2.41||
turkomp_283|Patates nişastası|333|0.06|82.02|0.29|0.85||
turkomp_285|Patates, kızartmalık, dondurulmuş|124|2.38|26.59|0.33|2.56||
turkomp_281|Patates, nişastalık, beyaz etli, Lady Rosetta, Hermes|70|1.48|14.73|0.23|1.54||
turkomp_282|Patates, sofralık, sarı, Marfona, Granola, Marabel|68|1.48|14.37|0.23|1.44||
turkomp_188|Patlıcan, közlenmiş, konserve|31|0.56|5.59|0.22|2.3||
turkomp_189|Patlıcan, kuru|263|11.76|30.18|1.83|39.64||
turkomp_186|Patlıcan, uzun|23|0.94|3.13|0.23|2.51||
turkomp_187|Patlıcan, yuvarlak, Topan|25|1.27|3.05|0.23|2.85||
turkomp_271|Pazı|22|1.44|2.74|0.25|1.7||
turkomp_235|Pırasa|34|0.26|5.9|0.33|3.01||
turkomp_267|Rezene, kök, sap|45|3.86|4.19|0.39|4.58||
turkomp_256|Roka|26|2.57|2.38|0.27|1.94||
turkomp_203|Salatalık|16|0.37|2.75|0.32|0.52||
turkomp_254|Şalgam|26|0.81|4.3|0.2|1.91||1.02
turkomp_232|Sarımsak, kök, sap|72|2.84|13.41|0.29|2.14||
turkomp_233|Sarımsak, kuru|129|5.21|24.48|0.54|2.64||
turkomp_234|Sarımsak, kuru, toz|367|17.25|68.07|0.66|9.81||
turkomp_228|Semizotu|22|2.64|1.77|0.12|1.59||
turkomp_695|Şevketi bostan|17|0.48|1.45|0.13|4.21||
turkomp_231|Soğan, mor, kuru|43|0.93|8.78|0.16|1.52||
turkomp_230|Soğan, sarı, kuru|40|1.16|7.88|0.18|1.23||
turkomp_229|Soğan, taze, kök, sap|29|1.31|4.63|0.19|1.72||
turkomp_715|Su teresi|33|4.85|0.33|0.4|4.42||
turkomp_717|Sunbala|45|0.53|8.92|0.27|2.45||
turkomp_721|Tekesakalı|39|0.19|6.03|0.83|3.55||
turkomp_257|Tere|28|2.45|1.84|0.52|3.3||
turkomp_252|Turp, Fındık|22|0.36|3.81|0.23|1.86||
turkomp_251|Turp, kırmızı iri|27|0.08|4.49|0.44|2.18||
turkomp_253|Turp, siyah|34|0.33|6.74|0.17|2.29||
turkomp_205|Turşu, acur|13|0.06|1.63|0.16|2.38||
turkomp_180|Turşu, biber|24|0.69|2.01|0|6.46||
turkomp_209|Turşu, fasulye|23|1.25|2.56|0.36|2.46||
turkomp_262|Turşu, havuç|12|0.19|0.23|0.22|4.03||
turkomp_197|Turşu, kelek|10|0.56|0.23|0.24|2.35||
turkomp_247|Turşu, lahana|13|0.19|1.47|0.22|2.35||
turkomp_273|Turşu, pancar, kırmızı|15|0.62|2.33|0.08|1.48||
turkomp_381|Ahududu|56|1.3|7.59|1.42|3.69||
turkomp_383|Ahududu, dondurulmuş|46|1.31|8.48|0.12|2.82||
turkomp_403|Ananas|49|0.43|9.37|0.39|3.15||
turkomp_405|Antep fıstığı, iç, kavlatılmamış, taze|600|17.64|10.56|51.15|13.54||
turkomp_688|Antep fıstığı, iç, kavrulmuş|608|18.29|16.13|49.96|10.32||
turkomp_357|Armut, kışlık, Deveci çeşidi|52|0.57|12.07|0.15|3.45||
turkomp_358|Armut, yazlık, Santa Maria çeşidi|54|0.51|10.96|0.15|3.5||
turkomp_331|Asma yaprağı, salamura|49|3.5|0.33|1.62|9.68||
turkomp_733|Atelması|109|0|14.49|3.26|10.63||
turkomp_317|Avokado|143|0.61|4.36|11.48|9.7||
turkomp_336|Ayva, Eşme çeşidi|60|0.35|13.92|0.14|3.23||
turkomp_387|Badem, iç, kavulmuş|600|20.57|10.36|50.22|12||
turkomp_386|Badem, kabuklu, tatlı, çağla|42|3.83|2.47|0.72|4.98||
turkomp_315|Bergamot, meyve kabuğu|69|0.76|10.92|0.37|9.53||
turkomp_384|Böğürtlen|49|1.02|6.92|0.97|4.02||
turkomp_400|Ceviz, iç, kuru|679|14.57|3.68|64.82|11.5||
turkomp_402|Ceviz, Pikan, kuru|703|9.51|4.74|69.91|8.25||
turkomp_377|Çilek|32|0.9|4.88|0.54|1.98||
turkomp_378|Çilek suyu|51|0|11.9|0.22|0.57||1.05
turkomp_380|Çilek, dondurulmuş|30|0.38|5.81|0.08|2.44||
turkomp_373|Dut, beyaz, kuru|336|2.76|74.83|0.84|8.92||
turkomp_371|Dut, beyaz, sofralık|63|0.56|12.99|0.49|2.16||
turkomp_334|Elma suyu|40|0|9.95|0|0.29||1.05
turkomp_333|Elma, güzlük ve kışlık, Fuji çeşidi|56|0.35|12.41|0.58|1.81||
turkomp_335|Elma, kuru|302|1.24|60.97|1.38|20.52||
turkomp_332|Elma, yazlık, Gala çeşidi|58|0.33|11.9|0.61|1.91||
turkomp_343|Erik, Avrupa erik grubu, kuru|268|2.51|56.4|0.88|12.18||
turkomp_341|Erik, Avrupa erik Grubu, Stanley çeşidi|58|0.15|13.74|0.23|1.39||
turkomp_340|Erik, Japon erik grubu, Black Amber çeşidi|54|0.16|10.97|0.52|2.2||
turkomp_409|Fındık ezmesi, şeker ilaveli|541|8.06|51.56|32.48|4.96||
turkomp_407|Fındık iç, beyazlatılmış|646|14.24|5.36|59.58|15.47||
turkomp_607|Fındık kreması, kakaolu|532|4.51|55.49|30.95|6.67||
turkomp_685|Fındık, iç, kavrulmuş|670|13.62|10.13|61.28|11.54||
turkomp_506|Geleboru|37|0.43|7.53|0.09|4.58||
turkomp_313|Greyfurt, Altıntop, Rio Red|38|0.22|8.01|0.18|1.59||
turkomp_312|Greyfurt, Altıntop, Star Ruby|40|0.22|8.6|0.2|1.42||
turkomp_320|Hurma, kuru|301|1.74|68.87|0.26|8.04||
turkomp_408|İğde, kültür, kuru|283|5.48|51.81|1.75|18.83||
turkomp_367|İncir, Bursa Siyahı|70|1.33|14.1|0.34|2.66||
turkomp_509|Kara dut (rum dutu) suyu|35|0.04|8.53|0.03|||1.05
turkomp_734|Karamuk|259|1.68|33.52|3.42|43.6||
turkomp_570|Karayemiş|75|1.4|14.72|0.54|2.81||
turkomp_404|Kayısı çekirdeği, iç|577|24.13|2.52|48.36|17.67||
turkomp_345|Kayısı suyu|58|0|14.28|0|0.35||1.05
turkomp_344|Kayısı, erkenci, sofralık , Tyrinthe|28|0.27|5.66|0.21|1.24||
turkomp_347|Kayısı, Hacıhaliloğlu, günkurusu|265|2.98|59.06|0.35|8.09||
turkomp_348|Kayısı, Hacıhaliloğlu, kükürtlü, kuru|252|2.96|56.2|0.34|7.45||
turkomp_349|Kayısı, konserve|50|0.31|10.71|0.16|2.2||
turkomp_728|Kebere|67|4.1|9.42|0.52|4.29||
turkomp_376|Keçiboynuzu, kuru|293|4.18|54.61|0.69|25.83||
turkomp_406|Kestane|176|1.01|39.28|0.93|3.32||
turkomp_339|Kiraz, beyaz, Starks Gold çeşidi|63|0.69|13.27|0.34|1.89||
turkomp_338|Kiraz, kırmızı, Ziraat 0900 Napolyon çeşidi|63|0.91|13.36|0.29|1.7||
turkomp_321|Kivi|63|0.37|13.62|0.18|2.73||
turkomp_392|Kızılcık|64|0.28|12.87|0.42|3.71||
turkomp_757|Kuş üzümü, kurutulmuş|322|2|74.69|0.64|4.5||
turkomp_309|Limon, Interdonato|43|0.44|8.73|0.36|1.41||
turkomp_310|Limon, Kütdiken|39|1.15|7.81|0.15|1.13||
turkomp_311|Limon, Meyer|42|1.13|7.82|0.39|1.39||
turkomp_307|Mandarin, Klemantin|50|0.47|10.7|0.1|2.09||
turkomp_308|Mandarin, Nova|46|0.37|9.38|0.56|1.22||
turkomp_306|Mandarin, Okitsu Wase|39|0.35|8.12|0.27|1.53||
turkomp_305|Mandarin, Ovari Satsuma|40|0.47|8.27|0.24|1.54||
turkomp_393|Marmelat, kızılcık|265|0|65.24|0.08|1.71||
turkomp_399|Marmelat, kuşburnu|275|0|67.31|0.12|2.13||
turkomp_395|Muz, Anamur çeşidi|79|0.55|18.14|0.11|1.69||
turkomp_396|Muz, İthal çeşit|77|0.58|17.64|0.28|1.57||
turkomp_370|Nar suyu|53|0|13.03|0.05|0||1.05
turkomp_369|Nar, Hicaz çeşidi|61|0.26|9.29|0.21|10.21||
turkomp_356|Nektarin, Big Top çeşidi|43|0.2|8.62|0.35|2.07||
turkomp_303|Portakal suyu|60|0.4|14.64|0|0.11||1.05
turkomp_302|Portakal suyu, konsantre|75|0|18.23|0|0.85||1.05
turkomp_500|Portakal, Navelina Göbekli çeşidi|45|0.17|9.93|0.2|1.48||
turkomp_301|Portakal, Valensiya çeşidi|49|0.7|9.18|0.6|1.89||
turkomp_300|Portakal, Washington Navel göbekli portakalı|49|0.32|10.49|0.24|1.74||
turkomp_382|Reçel, ahududu|273|0.19|66.85|0.06|2.32||
turkomp_337|Reçel, ayva|282|0.06|69.46|0|2.17||
turkomp_385|Reçel, böğürtlen|272|0.19|66.29|0.1|2.55||
turkomp_379|Reçel, çilek|285|0.06|70.27|0.06|1.35||
turkomp_368|Reçel, incir|282|0.19|69.59|0.06|1.41||
turkomp_346|Reçel, kayısı|265|0.13|65.14|0.22|0.98||
turkomp_304|Reçel, portakal|258|0.06|63.32|0|2.29||
turkomp_354|Reçel, şeftali|269|0.06|66.34|0.1|1.04||
turkomp_362|Reçel, vişne|276|0.13|67.92|0.1|1.58||
turkomp_353|Şeftali suyu|58|0|14.23|0|0.36||1.05
turkomp_352|Şeftali, erkenci|41|0.85|8.09|0.23|1.57||
turkomp_505|Şeftali, J. Hale çeşidi|46|0.96|8.99|0.3|1.82||
turkomp_355|Şeftali, konserve|51|0.63|11.41|0.06|1.27||
turkomp_318|Trabzon hurması, meyve et rengi kahverengi, kararsız|73|0.39|15.06|0.08|5.06||
turkomp_319|Trabzon hurması, meyve et rengi sarı, kararlı|71|0.66|15.3|0.08|3.34||
turkomp_330|Üzüm suyu, kırmızı|55|0.11|13.45|0|0.23||1.05
turkomp_503|Üzüm, beyaz şaraplık, Narince çeşidi|75|0.31|17.42|0.23|0.99||
turkomp_322|Üzüm, beyaz, erkenci, Yalova İncisi|63|0.46|13.7|0.43|1.44||
turkomp_328|Üzüm, beyaz, geç mevsim, Müşküle çeşidi|68|0.47|14.8|0.48|1.39||
turkomp_324|Üzüm, beyaz, orta mevsim, Razaki çeşidi|70|0.63|14.77|0.53|1.7||
turkomp_504|Üzüm, kırmızı şaraplık, Kalecik Karası çeşidi|75|0.61|16.74|0.29|1.44||
turkomp_323|Üzüm, renkli, erkenci, Kardinal çeşidi|65|0.38|14.31|0.37|1.42||
turkomp_329|Üzüm, renkli, geç mevsim, Hönüsü çeşidi|75|0.45|16.9|0.37|1.37||
turkomp_325|Üzüm, renkli, orta mevsim, Alphonse Lavalle çeşidi|68|0.63|14.75|0.34|1.98||
turkomp_327|Üzüm, siyah, çekirdekli, kuru|312|2.35|71.53|0.23|7.2||
turkomp_326|Üzüm, yuvarlak, çekirdeksiz, Sultaniye, kuru|305|2.42|70.82|0.2|5.14||
turkomp_361|Vişne suyu|51|0|12.69|0.08|0||1.05
turkomp_364|Vişne, dondurulmuş|39|0.69|7.97|0.08|1.79||
turkomp_363|Vişne, konserve|54|0.44|11.99|0.06|2.09||
turkomp_360|Vişne, Kütahya|61|0.59|12.02|0.45|3.16||
turkomp_394|Yaban mersini (mavi yemiş)|44|0.46|8.49|0.34|2.73||
turkomp_401|Yenidünya|46|1.11|8.14|0.54|2.05||
turkomp_758|Zeytin ezmesi, siyah|322|1.88|35.66|18.74|1.68||
turkomp_388|Zeytin, siyah, salamura|135|1.94|2.18|12.44|3.08||
turkomp_389|Zeytin, siyah, sele|113|1.44|1.01|10.78|3.26||
turkomp_390|Zeytin, yeşil, kokteyl, biberli|103|0.69|0.43|10.24|2.94||
turkomp_391|Zeytin, yeşil, salamura|143|1.94|1.73|13.55|3.15||
turkomp_732|Zingit|110|0.28|12.67|0.84|25.48||
turkomp_287|Bal, çam|327|0.13|81.73|0|0||
turkomp_288|Bal, çiçek|325|0.13|81.23|0|0||
turkomp_291|Çikolata, beyaz|544|2.75|65.52|30.04|0.03||
turkomp_292|Çikolata, bitter|570|4.79|55.68|36.26|1.12||
turkomp_293|Çikolata, sütlü|554|5.74|52.98|34.48|4.5||
turkomp_760|Çikolata, sütlü, fındıklı|550|6.16|55.13|33.27|2.5||
turkomp_296|Gofret, kakao kremalı, sütlü çikolata kaplamalı|453|5.38|66.29|16.6|8.36||
turkomp_295|Gofret, kremalı, vanilya aromalı|509|3.44|67.11|24.71|2.43||
turkomp_298|Puding, kakaolu, toz|387|2.25|84.28|3.34|5.54||
turkomp_289|Şeker, beyaz, küp|400|0|99.92|0|0||
turkomp_290|Şeker, esmer, küp|399|0|99.82|0|0||
turkomp_299|Şeker, pudra|400|0.25|99.44|0.17|0||
turkomp_761|Sütlü Çikolata, antepfıstıklı|557|8.3|46.76|36.22|5.5||
turkomp_410|Aromalı içecek, gazlı, portakal aromalı|47|0|11.65|0|0||1
turkomp_412|Aromalı içecek, gazlı, sade|37|0|9.13|0|0||1
turkomp_422|Bira|38|0|1.24|0|0||1.01
turkomp_398|Çay, kuşburnu|254|5.19|36.66|0.15|42.83||1
turkomp_411|Çay, siyah, kuru|269|21.56|21.37|0.44|46.68||1
turkomp_759|Doğal zengin mineralli gazlı içecek, limon aromalı|7|0.38|1.5|0|||1
turkomp_413|Kahve, çözünebilir|339|13.76|62.87|0.11|15.85||1
turkomp_415|Kola|43|0|10.65|0|0||1.04
turkomp_423|Likör, meyve|262|0|21.82|0|0||0.96
turkomp_417|Limonata|10|0|2.52|0|0.13||1
turkomp_424|Rakı (alk. ≥ % 40 hacmen)|233|0|0.41|0|0||0.96
turkomp_426|Şarap, beyaz ( alk.% 11-12.5 hacmen)|68|0|2.95|0|0||0.99
turkomp_425|Şarap, kırmızı ( alk.% 11-13.5 hacmen)|85|0|2.83|0|0||0.99
turkomp_414|Su, içme-kullanma|0|0|0.09|0|0||1
turkomp_420|Tonik|4|0|1.12|0|0||
turkomp_421|Toz meşrubat, limonlu|392|0.06|97.85|0|0||1
turkomp_436|Baharat karışımı, köfte harcı|310|11.06|55.46|2.56|10.41||
turkomp_668|Cips, mısır|530|5.75|55.78|30.22|5.71||
turkomp_669|Cips, patates|516|5.75|51.85|30.22|6.72||
turkomp_444|Çörek otu|387|22.5|10.16|20.18|37.14||
turkomp_433|Et suyu, tablet (bulyon)|244|7.56|20.74|13.55|4.59||1
turkomp_672|Hardal, katkısız|85|5.19|3.12|4.78|4.2||
turkomp_441|Hindistan cevizi, kuru, rende|682|5.62|4.25|67.22|18.91||
turkomp_698|Ihlamur, kurutulmuş|206|6.38|14.14|0|62.1||
turkomp_673|Jöle, toz|79|0.75|19.11|0|0||
turkomp_429|Kabartma tozu|203|0.75|47.51|0.37|3.33||
turkomp_674|Kahve kreması, toz|551|0.69|58.42|34.93|0.32||1
turkomp_675|Kakao, toz|495|18.87|31.09|31.79|4.59||
turkomp_676|Karabiber, top|297|20.06|24.69|3.46|43.19||
turkomp_435|Kekik, kuru|288|8.81|26.66|7.25|40.4||
turkomp_671|Ketçap, katkısız|112|1.13|25.34|0.17|2.37||
turkomp_437|Krem şanti, toz|477|1.63|78|17.29|1.23||
turkomp_747|Kuru Çorba Karışımı, ezogelin|318|12|54.32|4.76|5.1||
turkomp_748|Kuru Çorba Karışımı, Mercimek|314|16.38|50.94|3.49|6.5||
turkomp_438|Limon sosu, doğal|23|0|5.59|0.12|||
turkomp_427|Maya, hamur, kuru|353|39.05|21.58|7.48|21.6||
turkomp_428|Maya, hamur, yaş|104|12.48|7.24|1.06|7.66||
turkomp_670|Mayonez, katkısız|676|0.63|11.45|69.7|0.12||
turkomp_739|Sirke, elma|14|0.25|3.14|0|||
turkomp_439|Sirke, üzüm|3|0|0.87|0|0||
turkomp_442|Soya kıyma (tekstüre edilmiş soya proteini)|298|45.28|19.79|1.1|14.08||
turkomp_434|Tavuk suyu, tablet (bulyon)|243|6.86|18.78|14.5|5.03||1
turkomp_443|Tuz, iri salamura|0|0|0.03|0|0||
turkomp_430|Tuz, sofra, iyotlu|1|0|0.22|0|0||
turkomp_667|Tuz, sofra, iyotsuz|2|0|0.39|0|0||
turkomp_432|Vanilin, şekerli|386|0.44|95.35|0.07|1.02||
turkomp_586|Antep baklavası, fıstıklı|432|5.53|48.26|22.64|6.63||
turkomp_452|Aşure, Ankara|104|1.01|22.77|0.3|3.19||
turkomp_609|Aşure, İstanbul|87|2.22|15.2|0.44|6.53||
turkomp_608|Aşure, İzmir|98|1.88|19.57|0.52|3.76||
turkomp_683|Aşure, Konya|85|1.77|16.16|0.32|5.04||
turkomp_462|Ayran, yayık, Bursa|25|1.79|0.46|1.8|||1.03
turkomp_577|Ayran, yayık, Cevizli, Antalya|30|2.36|1.21|1.8|||1.03
turkomp_595|Ayran, yayık, Diyarbakır|30|2.23|1.18|1.8|||1.03
turkomp_553|Ayran, yayık, Mersin|26|2.11|0.07|1.88|||1.03
turkomp_492|Badem ezmesi, Edirne|498|9.63|42.91|30.49|6.61||
turkomp_613|Badem ezmesi, İstanbul|470|9.53|47.8|25.53|5.37||
turkomp_682|Baklava, cevizli, Safranbolu|451|4.1|54.66|22.63|6.22||
turkomp_463|Baklava, fıstıklı, İstanbul|422|5.13|44.47|22.51|10.59||
turkomp_465|Boza, İstanbul|74|0.64|15.57|0.6|1.73||1.1
turkomp_601|Bozdağ kestane şekeri, İzmir|277|1.06|62.43|1.26|5.79||
turkomp_523|Bulgur, pilavlık, Karaman|349|8.84|70.41|2.06|6.76||
turkomp_552|Çökelek, Çorum|177|26.86|1|7.26|||
turkomp_456|Çökelek, Mersin|171|27.37|1.89|6.02|||
turkomp_499|Çorum leblebisi|395|21.56|54.43|7.53|11.7||
turkomp_574|Çubuk turşusu, salatalık, Ankara|16|0.38|1.07|0.62|2.22||
turkomp_583|Denizli leblebisi|402|21.44|55.2|8.26|10.48||
turkomp_580|Dondurma, yanıksı, Antalya|187|3.96|35.84|3.14|||
turkomp_604|Döner, et, Kastamonu, pişmiş|316|25.94|0|23.6|||
turkomp_615|Döner, et, pişmiş, Bursa|333|22.33|0|27.12|||
turkomp_563|Edirne beyaz peyniri|306|17.16|4.71|24.24|||
turkomp_547|Erzincan tulum peyniri|334|19.59|9.21|24.32|||
turkomp_544|Eski kaşar, Kars|377|27.56|0.47|29.4|||
turkomp_591|Ezine peyniri|309|18.22|3.05|24.88|||
turkomp_468|Güllaç, yaprak, İstanbul|348|0.63|82.72|1.07|2.46||
turkomp_568|Gümüşhane dut pestili|392|5.06|74.89|7.04|4.39||
turkomp_602|Hardaliye, Kırklareli|67|0|16.76|0|||1
turkomp_530|İncir, kuru, Aydın, dağlık kesim|303|3.13|66.81|0.6|8.76||
turkomp_461|İncir, kuru, Aydın, ovalık kesim|298|3.31|64.41|0.8|10.06||
turkomp_529|İncir, kuru, İzmir|298|3.25|65.2|0.6|9.42||
turkomp_582|İskilip turşusu, salatalık, Çorum|8|0.38|0.36|0.2|1.56||
turkomp_496|İzmit pişmaniyesi|454|3.53|82.43|12.29|||
turkomp_565|Karnavas dut pekmezi, Erzurum|273|1|64.73|0.4|3.2||
turkomp_616|Kavurma, et, Diyarbakır|431|25.75|0|36.46|||
turkomp_617|Kavurma, et, Erzurum|463|29.69|0|38.27|||
turkomp_618|Kavurma, et, Konya|447|31.71|0|35.6|||
turkomp_636|Kazandibi, Ankara|172|3.7|24.59|6.3|1.18||
turkomp_635|Kazandibi, İstanbul|165|4.74|24.11|5.33|0.63||
turkomp_637|Kazandibi, izmir|177|3.13|27.36|6.04|0.41||
turkomp_464|Kefir, Ankara|58|3.29|3.11|3.65|||1.03
turkomp_621|Kefir, Kars|52|3|6.34|1.62|||1.03
turkomp_634|Keşkül, Ankara|135|3.7|17.86|5.11|1.29||
turkomp_632|Keşkül, İstanbul|141|2.49|19.5|5.66|1.04||
turkomp_633|Keşkül, İzmir|144|3.32|18.53|6.02|1.14||
turkomp_600|Kestane şekeri, Bursa|273|1.06|62.74|1.09|4.01||
turkomp_519|Lokum, kaymaklı, Afyon|376|0.81|72.56|8.79|1.54||
turkomp_644|Lokum, sade, İstanbul|359|0.13|89.28|0.19|0||
turkomp_471|Lokum, safranlı, antep fıstıklı, Safranbolu|422|3.56|76.38|10.46|3.8||
turkomp_472|Mantı, çiğ, Kayseri|292|12.63|45.52|5.71|4.01||
turkomp_622|Mantı, çiğ, Safranbolu|280|12.25|41.02|6.4|4.87||
turkomp_587|Maraş dondurması|176|4.85|31.79|3.26|||
turkomp_578|Mersin cezeryesi, cevizli|374|2.13|68.22|8.28|8.96||
turkomp_631|Muhallebi, Ankara|151|2.87|20.82|6.08|0.91||
turkomp_629|Muhallebi, İstanbul|143|3.51|18.48|5.64|2.09||
turkomp_534|Nar ekşisi, Gaziantep|310|0|77.55|0|0.05||
turkomp_532|Nar ekşisi, Hatay|308|0|77|0|0.23||
turkomp_473|Nar ekşisi, Mersin|311|0|77.53|0|0.21||
turkomp_612|Oltu cağ kebabı (döner, et, pişmiş)|302|21.06|0|24.24|||
turkomp_579|Pastırma çemeni, Kayseri|159|10.13|21.07|2.21|7.04||
turkomp_603|Pastırma, Kastamonu|173|28.5|2.99|4.61|2.57||
turkomp_495|Pekmez, Andız, Antalya|266|1.5|64.33|0|1.16||
turkomp_567|Pekmez, dut, Gümüşhane|272|1.13|64.87|0.2|3.04||
turkomp_560|Pekmez, dut, Kemaliye, Erzincan|273|0.69|65.04|0.16|4.2||
turkomp_469|Pekmez, harnup (keçiboynuzu), Antalya|270|1.25|65.67|0|0.98||
turkomp_451|Pekmez, incir, Manisa|254|1.19|61.01|0.06|2.23||
turkomp_528|Pekmez, üzüm, Çal, Denizli|243|1.06|59.44|0|0.3||
turkomp_540|Pekmez, üzüm, Güneydoğu Anadolu Bölgesi|242|1.13|59.28|0|0.21||
turkomp_527|Pekmez, üzüm, Kırşehir|246|0.75|60.62|0|0.29||
turkomp_525|Pekmez, üzüm, Ürgüp|240|1|58.7|0|0.47||
turkomp_564|Pestil, dut, Erzurum|385|5.75|71.52|7.64|3.52||
turkomp_561|Pestil, dut, Kemaliye, Erzincan|395|4.44|77.83|7.26|0.22||
turkomp_536|Pestil, üzüm, Gaziantep|353|1.31|84.49|0.33|3.27||
turkomp_526|Pestil, üzüm, Ürgüp, Nevşehir|354|0.31|85.96|0.26|3.06||
turkomp_454|Peynir, otlu, Van|291|19.52|3.28|22.19|||
turkomp_566|Peynir, tulum, İzmir|329|19.14|8.61|24.22|||
turkomp_554|Peynir, tulum, Mersin|340|19.84|7.75|25.52|||
turkomp_459|Reçel, gül, Isparta|316|0|78.49|0|1.08||
turkomp_588|Reçel, gül, Safranbolu|336|0|83.36|0|1.17||
turkomp_477|Salep, toz, Maraş|234|5.31|23.67|0|58.8||1
turkomp_623|Simit, İzmir|368|12.14|38.42|16.46|8.94||
turkomp_627|Sütlaç, Ankara|148|2.3|18.33|6.74|2.44||
turkomp_569|Sütlaç, Hamsiköy, Trabzon|128|3.64|16.04|5.32|0.63||
turkomp_628|Sütlaç, İstanbul|136|2.74|16.22|6.14|2.38||
turkomp_598|Tahin helvası, İstanbul|533|11.55|45.42|32.2|7.44||
turkomp_640|Tahin helvası, İzmir|530|10.87|47.32|31.39|7.24||
turkomp_597|Tahin helvası, Safranbolu|555|10.44|42.37|36.27|8.54||
turkomp_440|Tahin, İstanbul|676|20.03|3.26|62.2|11.3||
turkomp_638|Tahin, Konya|663|20.62|2.96|60.4|12.78||
turkomp_481|Tarsus şalgamı, Mersin|5|0|1.06|0|0.16||1.02
turkomp_584|Tavşanlı leblebisi, Kütahya|359|21.34|50.38|4.61|15.52||
turkomp_641|Tel kadayıf, çiğ (hammadde, Antakya künefesi)|314|8.78|62.63|2.44|3.02||
turkomp_545|Tel kadayıf, çiğ (hammadde, Erzurum kadayıf dolması)|301|8.32|60.26|2.21|3.62||
turkomp_546|Tel kadayıf, çiğ, Bingöl|315|8.27|64.17|2.08|3.22||
turkomp_548|Tel kadayıf, çiğ, Diyarbakır|305|8.27|61.66|2.02|3.54||
turkomp_487|Türk kahvesi, İstanbul|278|13.89|28.81|0.34|51.88||1
turkomp_599|Turşu, salatalık, Gedelek, Bursa|12|0.38|0.64|0.46|1.8||
turkomp_684|Yaprak sarma, etli, Safranbolu|182|5.88|20.4|7.47|4.87||
turkomp_575|Yaprak sarma, zeytinyağlı, Bursa|183|2.81|25.05|7.06|3.86||
turkomp_571|Yaprak sarma, zeytinyağlı, İzmir|184|3.19|23.18|7.76|4.22||
turkomp_572|Yaprak sarma, zeytinyağlı, Tokat|193|3|24.03|8.4|4.77||
turkomp_619|Yaz helvası, cevizli, İstanbul|427|7.31|60.17|16.25|5.45||
turkomp_620|Yaz helvası, cevizli, İzmir|441|9.75|55.53|18.86|4.88||
turkomp_590|Yaz helvası, cevizli, Safranbolu|437|9.5|59.26|16.94|4.59||
turkomp_489|Yoğurt, Silifke, Mersin|95|6.19|4.34|5.9|||
turkomp_592|Yoğurt, Silivri, İstanbul|89|5.49|4.08|5.67|||
turkomp_559|Yoğurt, süzme, Burdur|120|9.44|1.58|8.41|||
turkomp_642|Yoğurt, süzme, Konya|124|7.91|3.13|8.83|||
turkomp_558|Yoğurt, Van|122|6.06|4.83|8.76|||
turkomp_488|Zile pekmezi (beyaz, sert, üzüm pekmezi)|286|1|70.39|0|0.44||
turkomp_661|Bisküvi, düşük proteinli, glutensiz, PKU|446|2.11|81.75|12.18|0.67||
turkomp_655|Bisküvi, enerjisi azaltılmış, limon lifli, kepek eklenmiş|431|5.7|73.42|12.18|6.2||
turkomp_651|Bisküvi, glutensiz|471|2.11|69.27|19.61|4.42||
turkomp_645|Çikolata, sütlü, fruktozlu, diyabetik|552|7.02|52.85|33.81|3.95||
turkomp_646|Çikolata, sütlü, tatlandırıcılı, diyabetik|490|6.26|12.62|33.81|2.87||
turkomp_660|Ekmek, beyaz, tuzsuz|248|9.41|42.38|2.86|7.41||
turkomp_649|Ekmek, glutensiz, PKU|200|0|46.67|0.26|5.44||
turkomp_653|İzotonik sporcu içeceği|24|0|5.6|0|0||1
turkomp_663|Makarna, düşük proteinli, glutensiz, PKU|352|0|84.17|0.62|4.92||
turkomp_648|Makarna, glutensiz|350|5.99|75.01|1.74|5.16||
turkomp_652|Müsli, meyveli|404|8.4|64.76|10.36|9.15||
turkomp_647|Reçel, vişne, tatlandırıcılı, diyabetik|239|0.13|70.79|0|1.12||
turkomp_654|Süt, laktozsuz|45|2.55|5.01|1.62|0||1.03
turkomp_681|Tam tahıllı gevrek, meyveli|381|8.05|74.74|3.92|7.46||
turkomp_657|Tatlandırıcı, sorbitol ve sakarin bazlı, toz|240|0|99.78|0|0||
turkomp_662|Un, düşük proteinli, glutensiz, PKU|348|2.74|81.03|0.42|4.76||
turkomp_650|Un, glutensiz|353|2.62|80.51|1.12|5.26||
turkomp_659|Yoğurt, probiyotik, sade|75|4.47|5.95|3.75|0||
curated_doner_et|Döner (et)|255|23.2|0|17.8|0||
curated_doner_durum|Döner Dürüm|195.3|11.8|20.3|7|1|220|
curated_tavuk_doner|Tavuk Döner|214.7|22.9|0|13.4|0||
curated_tavuk_doner_durum|Tavuk Döner Dürüm|168.7|12.6|20.8|3.4|1|210|
curated_lahmacun|Lahmacun|253.5|10.2|39.1|5.8|2.2|140|
curated_izgara_kofte|Izgara Köfte|270.9|17.6|5|19.7|0.4|30|
curated_adana_kebap|Adana Kebap|299.6|17.6|0.6|25.3|0.2|120|
curated_urfa_kebap|Urfa Kebap|301.1|17.6|0.8|25.3|0.2||
curated_tavuk_sis|Tavuk Şiş|191|26.1|0.5|8.9|0|120|
curated_kuzu_sis|Kuzu Şiş|185.6|21.4|0|11.1|0||
curated_tavuk_izgara|Izgara Tavuk Göğsü|177.3|26.1|0|7.5|0||
curated_tavuk_sote|Tavuk Sote|143.8|14.7|3.1|7.9|0.8||
curated_et_sote|Et Sote|153.1|13.5|3.1|9.6|0.8||
curated_iskender|İskender Kebap|166.5|8.9|10|9.9|0.7||
curated_tantuni|Tantuni|193.9|11.8|22.2|5.9|1.1|180|
curated_cig_kofte|Çiğ Köfte (etsiz)|209.4|5.8|41.4|1.2|7.7|200|
curated_kokorec|Kokoreç|241|10.4|26.6|10|1.7|300|
curated_karniyarik|Karnıyarık|154.9|4.6|5.1|13.2|2.1|130|
curated_imam_bayildi|İmam Bayıldı|136|1.1|6.5|12.1|2.3||
curated_kuru_fasulye|Kuru Fasulye|123.8|5.3|15.9|4.4|4||
curated_nohut_yemegi|Nohut Yemeği (etli)|127.8|6.7|11.2|5|3.2||
curated_etli_bezelye|Etli Bezelye|91.4|5.3|8.9|4|3.2||
curated_turlu|Sebze Türlü|81.3|1|5.9|6.2|1.6||
curated_musakka|Musakka|135.8|3.9|5.7|10.9|1.7||
curated_biber_dolma|Etli Biber Dolması|143.5|4|14.4|7.8|1.2|130|
curated_yaprak_sarma|Zeytinyağlı Yaprak Sarma|182.3|1.8|18.1|11.3|0.6|22|
curated_lahana_sarma|Etli Lahana Sarma|148.4|4.4|16.6|7.2|1.5||
curated_zeytinyagli_fasulye|Zeytinyağlı Taze Fasulye|106.9|1.9|6.7|7.8|1.9||
curated_mercimek_corba|Mercimek Çorbası|58.5|3.1|6.7|1.7|1.4||
curated_ezogelin_corba|Ezogelin Çorbası|64.7|2.9|8.4|1.7|1.5||
curated_yayla_corba|Yayla Çorbası|56.9|1.9|5.5|3|0.1||
curated_tarhana_corba|Tarhana Çorbası|40.1|1|4.7|1.8|0.3||
curated_domates_corba|Domates Çorbası|38|0.9|3.8|2.1|0.5||
curated_tavuk_suyu_corba|Tavuk Suyu Çorbası|34.2|2|3.2|1.5|0.3||
curated_iskembe_corba|İşkembe Çorbası|50.9|2.7|2.5|3.3|0.1||
curated_pirinc_pilav|Pilav|171.2|2.7|29.5|4.4|0.6||
curated_bulgur_pilav|Bulgur Pilavı|166.1|3.3|24.5|5.5|4.4||
curated_nohutlu_pilav|Nohutlu Pilav|169.3|3.5|27.1|4.6|1.3||
curated_ic_pilav|İç Pilav|160.9|2.5|25.5|5.3|0.7||
curated_sehriyeli_pilav|Şehriyeli Pirinç Pilavı|169.8|2.7|29.1|4.4|0.6||
curated_makarna_domates|Domates Soslu Makarna|162.5|3.3|27.3|4.2|1.5||
curated_firin_makarna|Fırın Makarna|194.1|6.7|23.8|7.8|1||
curated_menemen|Menemen|148.5|6.4|3.3|12.2|0.9||
curated_sucuklu_yumurta|Sucuklu Yumurta|239.2|17.1|1.2|17.8|0||
curated_omlet|Omlet|179.8|11.9|1.3|13.7|0||
curated_menemen_peynirli|Peynirli Yumurta|213.1|13.8|0.9|16.7|0||
curated_kasarli_tost|Kaşarlı Tost|333.8|14.5|31.9|15.9|1.7|115|
curated_sucuklu_tost|Sucuklu Tost|325.8|15.8|29.5|15.4|1.6|125|
curated_simit|Simit|293.6|8.7|51.2|5.9|2.9|100|
curated_pogaca|Poğaça|454.8|10.3|57.2|19.8|2.1|70|
curated_acma|Açma|422.3|9.4|53.5|18.4|2|80|
curated_su_boregi|Su Böreği (peynirli)|317.7|9.9|31.5|16.5|1.3|100|
curated_sigara_boregi|Sigara Böreği|443.2|11.7|34.5|27.8|1.3|25|
curated_ispanakli_borek|Ispanaklı Börek|293.8|7.7|27|16.8|1.6|100|
curated_kiymali_pide|Kıymalı Pide|250.8|9.9|39.4|5.5|1.8|250|
curated_kasarli_pide|Kaşarlı Pide|343.1|13.9|43.7|12|1.6|230|
curated_gozleme_peynir|Peynirli Gözleme|272.2|8.8|36.4|9.7|1.4|160|
curated_gozleme_patates|Patatesli Gözleme|234.4|5.5|38.4|6.1|2|170|
curated_gozleme_kiymali|Kıymalı Gözleme|261.2|8.8|35.3|9|1.4|165|
curated_manti|Mantı (yoğurtlu)|158.2|5.3|17.5|7.2|0.7||
curated_coban_salata|Çoban Salata|116.9|1|4.7|10.7|1.4||
curated_mevsim_salata|Mevsim Salata|112.9|0.9|5.2|10.2|1.8||
curated_cacik|Cacık|63.9|2.4|3.5|4.6|0.2||
curated_haydari|Haydari|173.4|6.8|4.3|14.6|0.3||
curated_acili_ezme|Acılı Ezme|124.6|1.3|6.1|10.7|1.6||
curated_humus|Humus|303.7|10.1|20.7|18.6|6.3||
curated_patlican_salata|Patlıcan Salatası|145.8|3|8.1|12.1|3.2||
curated_kisir|Kısır|238.9|4.4|31.1|10|5.9||
curated_baklava|Baklava|496.9|7.3|63.8|24.4|2.9|80|
curated_sutlac|Sütlaç|131.2|2.8|24.2|2.5|0.1||
curated_kazandibi|Kazandibi|128.3|2.6|23.3|2.7|0.1||
curated_kunefe|Künefe|407.8|9.8|43|21.6|0.7||
curated_revani|Revani|313.2|7.2|64.9|2.2|1.5||
curated_sekerpare|Şekerpare|422.9|6|67.6|13.8|1.3||
curated_lokma|Lokma|517.6|5|69|24.2|1.3||
curated_asure|Aşure|129.6|2.7|22.3|3.2|2.1||
curated_kabak_tatlisi|Kabak Tatlısı|208.5|2.2|40.2|4.9|1.4||
curated_tulumba|Tulumba Tatlısı|511.6|5.9|73.3|21.2|1.4||
curated_hamburger|Hamburger (köfteli)|241.2|12.5|20.7|11.6|1.3|180|
curated_patates_kizartma|Patates Kızartması|234.7|2|19.2|16.3|2.8|150|
curated_pizza_karisik|Karışık Pizza|292.9|13.2|36.2|10.1|1.6|150|
curated_kumpir|Kumpir|153.8|4.7|13.2|8.9|2.1|350|
curated_cig_kofte_durum|Çiğ Köfte Dürüm|215.8|6.5|42.6|1.2|5|150|
curated_ayran|Ayran|38|2.5|2.3|2.1|0||1.03
curated_turk_kahvesi|Türk Kahvesi (orta şekerli)|26.7|0|6.7|0|0||1
curated_kofte_ekmek|Köfte Ekmek|228.1|10.7|24.8|9.1|1.6|200|
curated_kadinbudu_kofte|Kadınbudu Köfte|333.9|13.3|17.5|23|0.4|50|
curated_tavuk_pirzola|Tavuk Pirzola|211.1|20|0|14.4|0||
curated_ali_nazik|Ali Nazik|119.9|5.2|3.8|9.5|1.2||
curated_tavuklu_pilav|Tavuklu Pilav|149.7|5.9|22.2|3.8|0.4||
curated_balik_ekmek|Balık Ekmek|175.6|13|24.8|2.4|1.5|200|
curated_hamsi_tava|Hamsi Tava|305.8|20.6|11.3|19.2|0.4||
curated_midye_dolma|Midye Dolma|266|6.2|33.9|11.3|0.8|25|
curated_midye_tava|Midye Tava|287|11.7|20.9|16.9|0.7||
curated_sahanda_yumurta|Sahanda Yumurta|193.6|12|0.7|15.4|0||
curated_cilbir|Çılbır|158.5|9.9|1.9|12|0||
curated_roka_salata|Roka Salatası|125.5|1.7|3.3|12.2|1.3||
curated_mercimek_koftesi|Mercimek Köftesi|254.6|10.4|34|6.8|7.1|25|
curated_kadayif|Tel Kadayıf|433.9|5.6|56.9|20.8|1.7||
curated_gullac|Güllaç|177.3|4.2|24.7|7.2|0.7||
curated_muhallebi|Muhallebi|115.9|2.5|20.3|2.8|0.1||
curated_profiterol|Profiterol|277.1|6.1|34.6|12.6|1.2||
curated_trilece|Trileçe|229.1|5.4|35.1|7.3|0.5||
curated_dondurma|Dondurma (sade)|177.3|2.5|22.6|8.6|0||
curated_corba_sebze|Sebze Çorbası|22.7|0.3|2.7|1.2|0.6||
curated_corba_brokoli|Brokoli Çorbası|40.4|1.3|3.9|2|0.7||
curated_corba_mantar|Mantar Çorbası|39.5|1.4|3.4|2.4|0.3||
curated_corba_dugun|Düğün Çorbası|56.7|3.3|2.8|3.5|0.1||
curated_corba_sehriye|Şehriye Çorbası|41.6|1|5.6|1.6|0.3||
curated_corba_paca|Kelle Paça Çorbası|41.9|2.8|1.8|2.6|0.1||
curated_corba_balik|Balık Çorbası|29.3|3.7|2.8|0.4|0.3||
curated_corba_analikizli|Analı Kızlı Çorbası|68.8|3.1|9.3|1.6|2||
curated_corba_toyga|Toyga Çorbası|54.3|1.6|5.7|2.7|0.9||
curated_corba_yogurtlu|Yoğurt Çorbası|50.1|1.6|5.4|2.4|0.1||
curated_beyti_kebap|Beyti Kebap|249|12.1|15.6|14.9|0.7||
curated_cag_kebap|Cağ Kebabı|381.3|22.3|1.1|32|0.2|90|
curated_patlican_kebap|Patlıcan Kebabı|176.2|8.4|4|14.3|1.9||
curated_kuzu_tandir|Kuzu Tandır|407.3|24|0|34.7|0||
curated_kuzu_incik|Kuzu İncik|361.1|18.6|2.3|30.8|0.5||
curated_etli_guvec|Etli Güveç|122.2|8|5.4|7.7|1.5||
curated_hunkar_begendi|Hünkar Beğendi|142.4|10.5|6|8.6|1.3||
curated_tas_kebap|Tas Kebabı|188.3|16.7|3.1|11.9|0.7||
curated_orman_kebap|Orman Kebabı|134|9.3|7.7|7.2|1.9||
curated_sac_kavurma|Sac Kavurma|159.9|13|2.9|10.8|0.8||
curated_kavurma|Et Kavurma|263.3|27.2|0.1|16.9|0||
curated_ciger_tava|Ciğer Tava|284.1|21.4|7.6|18.7|0.3||
curated_bonfile|Dana Bonfile|251.5|28.5|0.1|15.2|0||
curated_dana_rosto|Dana Rosto|215.4|24.2|2.1|12|0.6||
curated_icli_kofte|İçli Köfte|360.9|10|30.3|21.7|5.7|90|
curated_sulu_kofte|Sulu Köfte|96.5|5.4|5.8|5.6|0.4||
curated_inegol_kofte|İnegöl Köfte|329.1|21.1|6.5|23.9|0.5|45|
curated_akcaabat_kofte|Akçaabat Köfte|324.3|21|5.8|23.8|0.3||
curated_terbiyeli_kofte|Terbiyeli Köfte|105.4|6.1|6|6.2|0.1||
curated_etli_patates|Etli Patates Yemeği|119.8|6.5|9|6.1|1.5||
curated_tavuk_guvec|Tavuk Güveç|129.2|9|3.1|9.2|1.2||
curated_tavuk_kavurma|Tavuk Kavurma|240|29.8|0|12.8|0||
curated_tavuk_sinitzel|Tavuk Şinitzel|297.1|22.2|11.9|17.1|0.7||
curated_tavuk_haslama|Tavuk Haşlama|140.1|25.3|2|2.9|0.5||
curated_tavuk_kanat|Izgara Tavuk Kanat|245.8|24.6|0|16.2|0||
curated_tavuklu_makarna|Tavuklu Makarna|192.6|8|22.7|7.4|1||
curated_pilav_ustu_tavuk|Pilav Üstü Tavuk|145.6|7.6|18.1|4.4|0.3||
curated_levrek_izgara|Izgara Levrek|171.1|26|0|7.6|0||
curated_cipura_izgara|Izgara Çipura|214|24.8|0|12.8|0||
curated_somon_izgara|Izgara Somon|306.4|26.5|0|21.4|0||
curated_alabalik_tava|Alabalık Tava|284.7|21.7|7.8|18.4|0.3||
curated_palamut_firin|Fırında Palamut|287|22.2|1.6|21.4|0.4||
curated_kalamar_tava|Kalamar Tava|291.4|16.9|16.6|16.8|0.5||
curated_karides_guvec|Karides Güveç|134.7|13.9|1.8|8.3|0.5||
curated_sardalya_izgara|Sardalya (konserve, ızgara)|268.4|26.1|0|18.1|0||
curated_zy_enginar|Zeytinyağlı Enginar|114.8|2.4|5.8|8.4|4.6||
curated_zy_pirasa|Zeytinyağlı Pırasa|126.8|0.8|11.4|8.1|2||
curated_zy_kereviz|Zeytinyağlı Kereviz|106.5|1.3|7.2|7.2|2.5||
curated_zy_bakla|Zeytinyağlı Bakla|125.1|3.5|4.9|9.5|4.1||
curated_barbunya_pilaki|Barbunya Pilaki|132|4.9|15|6|5.4||
curated_fava|Fava|167.9|3.1|4.9|14.5|3.6||
curated_bamya_yemegi|Bamya Yemeği|111.6|5.8|6.8|6.2|2.7||
curated_ispanak_yemegi|Ispanak Yemeği|119.8|3.7|11.1|7.4|2.5||
curated_pirasa_yemegi|Pırasa Yemeği|121.5|1|12.1|7|2.2||
curated_karnabahar_yemegi|Karnabahar Yemeği|93.5|1.7|4.7|7|2.1||
curated_brokoli_haslama|Haşlanmış Brokoli|71.4|3.1|4.4|3.8|2.7||
curated_mucver|Kabak Mücver|232.4|6.3|12.7|17.3|1.1|50|
curated_kabak_dolma|Kabak Dolması|129|3.8|11.7|7.5|0.9||
curated_domates_dolma|Domates Dolması|134.9|1.8|14.3|8|1.3||
curated_mantar_sote|Mantar Sote|88.9|4|5.1|6.7|1.3||
curated_kuskus_pilavi|Kuskus Pilavı|172.3|4.6|27.5|4.5|1.8||
curated_eriste|Erişte|175.1|3.1|27.1|5.7|1.2||
curated_patates_pure|Patates Püresi|118.6|1.8|12.2|6.7|1.6||
curated_firin_patates|Fırında Patates|145.4|1.8|17.5|7.2|2.6||
curated_sebzeli_pilav|Sebzeli Pilav|154.6|2.8|25.9|4.3|1.4||
curated_mercimekli_bulgur|Mercimekli Bulgur Pilavı|177.1|5.4|24.2|5.6|4.7||
curated_arpa_sehriye|Arpa Şehriye Pilavı|165.2|4.3|25.6|4.8|1.1||
curated_kahvalti_beyaz_peynir|Beyaz Peynir|270|16|1.5|22|0|30|
curated_kahvalti_kasar|Kaşar Peyniri|360|25|2|28|0|25|
curated_kahvalti_tulum|Tulum Peyniri|334|19.6|9.2|24.3|0||
curated_kahvalti_lor|Lor Peyniri|98|11|3|4|0||
curated_kahvalti_labne|Labne|250|6|4|23|0||
curated_kahvalti_kaymak|Kaymak|585|1|3.3|63.1|0||
curated_kahvalti_bal|Bal|304|0.3|82|0|0.2||
curated_kahvalti_recel|Reçel|273|0.2|66.8|0.1|1.1||
curated_kahvalti_tereyagi|Tereyağı|753|0.2|0.9|83.2|0||
curated_kahvalti_zeytin_siyah|Siyah Zeytin|150|1|6|14|1.6|4|
curated_kahvalti_zeytin_yesil|Yeşil Zeytin|103|0.7|0.4|10.2|3.3|4|
curated_bal_kaymak|Bal Kaymak|444.5|0.7|42.6|31.6|0.1||
curated_katmer|Katmer|520.8|7.7|47.8|33.4|2.6||
curated_bazlama|Bazlama|238.6|7.7|47.2|1.6|1.7|80|
curated_pisi|Pişi|431.6|7.4|45.5|23.9|1.7|45|
curated_sahanda_sucuk|Sahanda Sucuk|487.5|27.5|2.5|40|0||
curated_yumurta_haslanmis|Yumurta|143|12.6|0.7|9.5|0|55|
curated_kahvalti_tabagi|Serpme Kahvaltı Tabağı|192.9|7.9|16.7|10.5|0.9||
curated_saksuka|Şakşuka|154.5|1.2|7|14.1|2.7||
curated_piyaz|Piyaz|154.1|5.1|15.4|8.2|4||
curated_gavurdagi|Gavurdağı Salatası|143.4|2.1|5.6|13.2|1.7||
curated_semizotu_salata|Semizotu Salatası|75.9|3.2|3.1|5.4|||
curated_babagannus|Babagannuş|176.5|3.4|9.9|14.9|4.1||
curated_girit_ezme|Girit Ezmesi|276.9|10|4.6|24.7|1.2||
curated_atom_meze|Atom Meze|120.9|3.6|4.2|10|0.3||
curated_mercimek_salata|Mercimek Salatası|153|6.8|12.1|7.6|3.1||
curated_marul_salata|Marul Salatası|79.7|0.7|2.6|7.1|1.8||
curated_turp_salata|Turp Salatası|90.9|0.3|4.5|7.6|2||
curated_irmik_helvasi|İrmik Helvası|402.4|5.8|56.1|17.1|1.8||
curated_un_helvasi|Un Helvası|393.9|4.7|57|16.1|0.9||
curated_tahin_helvasi|Tahin Helvası|533|11.6|45.4|32.2|||
curated_lokum_tatli|Lokum|376|0.8|72.6|8.8|||
curated_kemalpasa|Kemalpaşa Tatlısı|250|4.1|55.2|1.1|0.9||
curated_hosmerim|Höşmerim|288.1|8.4|37.8|10.9|0.6||
curated_cezerye|Cezerye|297.4|2.9|52.9|9.3|3.4||
curated_ayva_tatlisi|Ayva Tatlısı|147.1|0.2|35.9|0.1|1.5||
curated_incir_tatlisi|İncir Tatlısı|182.7|2.1|31.3|5.4|2.6||
curated_supangle|Supangle|192.8|3.1|31.4|6.2|0.8||
curated_tavukgogsu|Tavukgöğsü|152.8|4.3|26.7|3.2|0.1||
curated_zerde|Zerde|121|1|28.8|0.1|0.3||
curated_magnolya|Magnolya|205.9|3.4|29|8.4|0.3||
curated_kadayif_dolma|Kadayıf Dolması|345.3|5.6|56.8|11.1|1.8||
curated_pismaniye|Pişmaniye|464.4|3.6|79.6|14.3|0.9||
curated_sekerli_kurabiye|Un Kurabiyesi|522.2|6.1|63.1|26.8|1.5|30|
curated_cay|Çay|0|0|0|0|0||1
curated_cay_sekerli|Şekerli Çay|7.8|0|2|0|0||1
curated_salgam_icecek|Şalgam Suyu|26|0.8|4.3|0.2|||1.02
curated_boza_icecek|Boza|74|0.6|15.6|0.6|||1.1
curated_sutlu_kahve|Sütlü Kahve|38.4|1.9|2.9|2.2|0||1.03
curated_salep_icecek|Salep|100.4|2.8|15.1|3.2|0||1.03
curated_ihlamur|Ihlamur|0|0|0|0|0||1
curated_meyve_elma|Elma|52|0.3|13.8|0.2|2.4|150|
curated_meyve_muz|Muz|89|1.1|22.8|0.3|2.6|120|
curated_meyve_portakal|Portakal|47|0.9|11.8|0.1|2.4|180|
curated_meyve_seftali|Şeftali|39|0.9|9.5|0.3|1.5|150|
curated_meyve_kayisi|Kayısı|48|1.4|11.1|0.4|2|35|
curated_meyve_erik|Erik|46|0.7|11.4|0.3|1.4|60|
curated_meyve_armut|Armut|52|0.6|12.1|0.1|3.1|170|
curated_meyve_karpuz|Karpuz|30|0.1|6.8|0.1|0.4|250|
curated_meyve_kavun|Kavun|31|0.3|6.7|0.2|0.8|200|
curated_meyve_incir|İncir|70|1.3|14.1|0.3|2.9|50|
curated_meyve_kuru_kayisi|Kuru Kayısı|265|3|59.1|0.3|7.3|8|
curated_meyve_kuru_uzum|Kuru Üzüm|322|2|74.7|0.6|4.5||
curated_meyve_hurma|Hurma|301|1.7|68.9|0.3|8|10|
curated_kuruyemis_badem|Badem|600|20.6|10.4|50.2|12.5||
curated_kuruyemis_ceviz|Ceviz|654|15|14|65|6.7||
curated_kuruyemis_findik|Fındık|628|15|17|61|9.7||
curated_kuruyemis_fistik|Antep Fıstığı|560|20|28|45|10.6||
curated_kuruyemis_yer_fistigi|Yer Fıstığı|570|23.5|10.5|45.4|8.4||
curated_kuruyemis_kabak_cekirdegi|Kabak Çekirdeği|619|28.9|10.7|50|6||
curated_yulaf_ezmesi|Sütlü Yulaf Ezmesi|145.2|6.6|20.2|4.4|2.5||
curated_yulaf_kuru|Yulaf Ezmesi|389|16.9|66.3|6.9|10.1||
curated_granola_kase|Granola|471|10|64|20|8.9||
curated_protein_shake|Protein Shake (sütlü)|100|11.4|5.1|3.8|0.3||1.03
curated_whey_tozu_kuru|Whey Protein Tozu|400|80|8|5|3.1||
curated_yogurt_meyveli|Meyveli Yoğurt Kasesi|80.5|4.3|9.3|3.1|1.2||
curated_chia_puding|Chia Puding|127.8|4.6|13.6|6.6|3.9||
curated_avokado_tost|Avokado Tost|187.7|9|16.7|9.9|4.5||
curated_ton_salata|Ton Balıklı Salata|123.4|10.2|3.6|7.8|1.1||
curated_tavuklu_salata|Tavuklu Salata|98.5|10.6|2|5.2|0.9||
curated_hindi_fume_dilim|Hindi Füme|104|17|3|2.5|0|20|
curated_suzme_yogurt|Süzme Yoğurt|110.4|7.2|6.7|6.1|0||
curated_ekmek_beyaz|Ekmek|265|8.5|49|3|2.7|30|
curated_ekmek_tam|Tam Buğday Ekmeği|247|13|41|3.4|6|30|
curated_ekmek_cavdar_d|Çavdar Ekmeği|259|8.5|48.3|3.3|5.8|30|
curated_lavas|Lavaş|275|9|54|1.3|1.9|60|
curated_pide_ekmek|Pide Ekmeği (Ramazan)|267.3|8.2|51.5|2.8|2.3||
curated_sucuklu_pide|Sucuklu Pide|331.7|15.2|35.2|13.9|1.3||
curated_yumurtali_pide|Yumurtalı Pide|254.4|12.7|32.1|7.8|1.2||
curated_kusbasili_pide|Kuşbaşılı Pide|214.3|12.9|33.7|2.7|1.5||
curated_talas_boregi|Talaş Böreği|426.5|10.6|32.8|27.6|1.4|100|
curated_kol_boregi|Kol Böreği|344.4|10.9|29.5|19.5|1.2|100|
curated_pacanga_boregi|Paçanga Böreği|422.7|19.5|25.9|26.3|0.9|60|
curated_cig_borek|Çiğ Börek|391.4|10.4|31.5|24.4|1.3|120|
curated_keskek|Keşkek|145.6|7.6|15.2|5.6|2.7||
curated_yalanci_dolma|Yalancı Dolma|221.6|2.1|24.7|12.4|1|25|
curated_mezgit_tava|Mezgit Tava|246.8|18.1|9.8|14.9|0.4||
curated_istavrit_izgara|Izgara İstavrit|244.4|23.5|0|16.7|0||
curated_kozlenmis_patlican|Közlenmiş Patlıcan|104.5|1.3|7.8|8.3|3.9||
curated_kozlenmis_biber|Közlenmiş Biber|105.8|1.3|7.8|8.3|2.2||
curated_tavuk_burger|Tavuk Burger|225.3|12.5|23.2|8.5|1.6|220|
curated_citir_tavuk|Çıtır Tavuk|349.9|21.1|20|19.9|0.9|150|
curated_tavuk_nugget|Tavuk Nugget|355|19.6|21.6|20.4|1.2|16.67|
curated_pizza_margarita|Margarita Pizza|303.3|11.9|34.9|12.4|1.8|150|
curated_ayvalik_tostu|Ayvalık Tostu|340.8|14.5|29.3|17.7|1.8|180|
curated_sandvic_peynirli|Peynirli Sandviç|202|8.2|26.6|6.5|1.8|140|
curated_misir_haslanmis|Haşlanmış Mısır|86|3.3|19|1.4|2||
curated_kestane_kebap|Kestane Kebap|196|1.6|44.2|1.3|||
curated_waffle_meyveli|Waffle (meyveli)|239.6|6.4|38|6.8|2||
curated_gazoz_icecek|Gazoz|40|0|10|0|0||1.04
curated_maden_suyu|Maden Suyu|0|0|0|0|0||1
curated_meyveli_sut|Meyveli Süt|90.7|3.6|12.4|3.7|1.1||1.03
curated_firin_sutlac|Fırın Sütlaç|157|3.6|28.2|3.3|0.2||
curated_keskul|Keşkül|176.7|4.5|22.5|7.4|1.1||
curated_yas_pasta|Yaş Pasta|308.4|6.2|40.3|13.4|0.6|100|
curated_kek_sade|Sade Kek|369.1|6.8|46.6|16.9|0.9|50|
curated_brownie|Brownie|509.6|6.4|56.3|28.7|2.6|50|
curated_tiramisu|Tiramisu|309.4|4.1|35.3|17.9|1.6|175|
curated_bisküvi_sade|Bisküvi|450|7|70|16|0.8|6|
curated_misir_gevregi_sutlu|Mısır Gevreği (sütlü)|129.1|4.2|22.1|3|0.6||
curated_sut_tam|Süt|64|3.2|4.8|3.6|0||1.03
curated_yogurt_sade|Yoğurt|69|4.5|4.2|3.8|0||
curated_kefir_icecek|Kefir|55|3.3|4.5|2.9|0||1.03
curated_cikolata_bar|Sütlü Çikolata|535|7.6|59.4|29.7|3.4|6.67|
curated_meyve_salatasi|Meyve Salatası|56.2|0.7|14.4|0.2|2.4|150|
curated_smoothie_muzlu|Muzlu Smoothie|81.5|2.4|13.6|2.4|0.9||1.03
curated_patates_salatasi|Patates Salatası|133.5|1.4|12.4|8.5|1.9||
curated_nohut_salatasi|Nohut Salatası|152|4.9|11.9|8.3|3.5||
curated_kuru_kofte|Kuru Köfte|346.6|18.1|5.5|27.7|0.4|35|
curated_peynirli_makarna|Peynirli Makarna|182.8|4.6|23.1|7.7|1||
curated_sucuklu_menemen|Sucuklu Menemen|165.4|9|3.3|12.8|0.8||
curated_yesil_mercimek|Yeşil Mercimek Yemeği|114.8|4.9|9.3|5.2|5.7||
curated_tarator|Tarator|232.2|5.8|6.3|21.3|1.1||
curated_kozlenmis_domates|Közlenmiş Domates Salatası|112.3|1.3|5.8|9.8|1.5||
curated_enginar_salata|Enginar Salatası|106.3|2.1|2.8|8.7|4.6||
curated_yesil_salata|Yeşil Salata|68.4|1.1|3|5.8|1.5||
curated_dondurma_kulah|Dondurma Külahı|203.6|3.7|29.2|7.9|0.3||
curated_sigara_boregi_peynir|Peynirli Muska Böreği|420.3|11.2|30|27.7|1.2|40|
curated_pogaca_peynirli|Peynirli Poğaça|376.9|10.6|36.9|20.3|1.4|70|
curated_ayran_evde|Ayran (ev yapımı)|20.7|1.3|1.3|1.1|0||1.03
curated_espresso_tek|Espresso|2|0.1|0|0|0||1
curated_americano|Americano|0.5|0|0|0|0||1
curated_latte|Latte|50.7|2.5|3.8|2.8|0||1
curated_cappuccino|Cappuccino|44.4|2.2|3.3|2.5|0||1
curated_mocha|Mocha|96|2.6|10.9|4.7|0.5||1
curated_filtre_kahve|Filtre Kahve|0.1|0|0|0|0||1
curated_badem_sutu_icecek|Badem Sütü|17|0.6|0.6|1.5|0.2||1.03
curated_yulaf_sutu_icecek|Yulaf Sütü|48|1|7|1.5|0||1.03
curated_soya_sutu_icecek|Soya Sütü|43|3.3|2.6|1.8|0.5||1.03
curated_enerji_icecegi|Enerji İçeceği|45|0|11|0|0||1.04
curated_sushi_somon|Sushi (somon)|159|7.1|24.2|3.4|0.4|30|
curated_california_roll|California Roll|136.5|2.6|26|2.5|1.5|27.5|
curated_burrito|Burrito|246.7|11|27.1|10.5|2.3|300|
curated_taco|Taco|199.5|10.5|13.5|11.7|2.2|110|
curated_quesadilla|Quesadilla|314.2|18.6|25.8|15.2|1.7|180|
curated_nachos|Nachos|437.3|12.1|39.6|26|3.5||
curated_pad_thai|Pad Thai|172.5|11.5|19.4|5.1|1.3||
curated_ramen|Ramen|82.4|4.9|10.8|2.1|0.5||
curated_pho|Pho|51.4|2.6|9.3|0.6|0.2||
curated_spring_roll|Spring Roll|123.3|6.3|24.8|0.4|0.9|60|
curated_fried_rice|Kızarmış Pirinç|151.5|4.4|23.3|4.4|1.2||
curated_kore_bibimbap|Bibimbap|126.6|7|19.4|2.2|0.8||
curated_kimchi_meze|Kimchi|15|1.1|2.4|0.5|1.6||
curated_curry_tavuk|Tavuk Curry|185.3|9.8|2.5|15.1|0.5||
curated_falafel|Falafel|415.7|12.5|28.5|24.7|8.4|25|
curated_shawarma|Shawarma|161.6|10.9|19.9|4.1|1.1|250|
curated_lazanya|Lazanya|206.1|10.5|19.3|9.3|1.2||
curated_risotto|Risotto|160.6|5|19.7|6.6|0.4||
curated_gnocchi|Gnocchi|174.7|4.2|23.5|6.7|1.8||
curated_paella|Paella|160.8|7.5|20|5.5|0.8||
curated_carbonara|Carbonara|233.4|12|24|9.4|1||
curated_pesto_makarna|Pesto Makarna|227.5|5.7|24.9|11.6|1.3||
curated_quiche|Quiche|372.3|10.9|18.8|27.9|0.6|100|
curated_club_sandvic|Club Sandviç|198.4|12|20.5|7.1|1.6|250|
curated_hot_dog|Hot Dog|254.5|9.6|24.2|13.3|1.1|150|
curated_cheeseburger|Cheeseburger|248.1|13.1|18.5|13.4|0.9|220|
curated_caesar_salata|Caesar Salata|157.6|10.9|5.7|9.7|1.3||
curated_yunan_salatasi|Yunan Salatası|128.4|3.5|3.3|11.4|0.7||
curated_guacamole|Guacamole|121.1|1.7|7.7|10.4|5.1||
curated_tofu_sote|Tofu Sote|127.8|7.7|3.1|10.3|0.6||
curated_edamame_meze|Edamame|121|11.9|8.9|5.2|4.8||
curated_kinoa_salata|Kinoa Salatası|141.3|3.7|16.7|6.8|2.1||
curated_kruvasan|Kruvasan|486.7|7.9|41.7|31.5|1.5|65|
curated_pankek|Pankek|263.6|8|34.4|10.1|0.9|60|
curated_krep|Krep|206.8|7.7|22.6|9.2|0.7|80|
curated_bagel|Bagel|258.8|7.9|48.9|3.2|2.3|100|
curated_donut|Donut|490.9|6.7|56.4|26.1|1.1|60|
curated_muffin|Muffin|404.3|7|50.7|18.9|1|130|
curated_cheesecake|Cheesecake|393.1|6|33.4|26.4|0.1|175|
curated_churros|Churros|412.4|4.4|43.7|24.1|1.1|45|
curated_granola_bar|Granola Bar|425.9|11.4|66.4|14.6|7.4|40|
curated_protein_bar|Protein Bar|438.5|40|39.5|15|5.3|60|
curated_yunan_yogurdu_k|Yunan Yoğurdu|97|9|3.9|5|0||
curated_cheddar_peynir|Cheddar Peyniri|403|22.9|3.4|33.1|0|25|
curated_mozzarella_peynir|Mozzarella|300|22.2|2.2|22.4|0||
curated_parmesan_peynir|Parmesan|392|35.8|3.2|25.8|0||
curated_krem_peynir_g|Krem Peynir|342|5.9|4.1|34.2|0||
curated_fistik_ezmesi_k|Fıstık Ezmesi|588|25.1|20|50.4|5||
curated_cikolata_krema_k|Çikolatalı Krema|539|6.3|57.9|30.9|5.4||
curated_jambon_dilim|Jambon|145|20.9|1.5|5.5|1.3|20|
curated_salam_dilim|Salam|336|19|2.4|28|0|15|
curated_bacon_dilim|Bacon|541|37|1.4|42|0|12|
curated_hindi_gogus_dilim|Hindi Göğüs Füme|104|17.1|3.5|2.4|0|20|
curated_mayonez_k|Mayonez|680|1|0.6|75|0||
curated_ketcap_k|Ketçap|101|1.7|25.8|0.1|0.3||
curated_hardal_k|Hardal|66|4.4|5.8|3.3|4||
curated_soya_sosu_k|Soya Sosu|53|8.1|4.9|0.6|0.8||
curated_akcaagac_k|Akçaağaç Şurubu|260|0|67|0.1|0||
curated_patates_cips_k|Patates Cipsi|536|7|53|34|4.8||
curated_misir_cips_k|Mısır Cipsi|489|6.7|63|24|5.4||
curated_kinoa_haslanmis|Haşlanmış Kinoa|126.9|4.9|22.1|2.1|2.4||
curated_esmer_pirinc_pilav|Esmer Pirinç Pilavı|153.3|2.6|25.7|4.3|1.2||
curated_tofu_ham|Tofu|76|8.1|1.9|4.8|0.3||
curated_tavuk_gogus_haslanmis|Tavuk Göğsü (haşlanmış)|171.4|32.9|0|3.7|0|150|
curated_tavuk_but_haslanmis|Tavuk But (haşlanmış)|201.4|25|0|11.1|0||
curated_hindi_gogus_haslanmis|Hindi Göğsü (haşlanmış)|135.3|28.9|0|2|0||
curated_dana_biftek|Dana Biftek (ızgara)|206.9|28.9|0|10.1|0||
curated_kuzu_pirzola_izgara|Kuzu Pirzola (ızgara)|194.3|25.3|0|10.4|0|60|
curated_kuzu_but_firin|Kuzu But (fırın)|174.3|27.6|0|7.1|0||
curated_makarna_haslanmis|Makarna (haşlanmış, sade)|158.2|3.7|33.1|0.8|1.4||
curated_pirinc_haslanmis|Pirinç (haşlanmış, sade)|121.8|2.4|27|0.2|0.5||
curated_bulgur_haslanmis|Bulgur (haşlanmış, sade)|140|3.6|28|0.8|5||
curated_esmer_pirinc_haslanmis|Esmer Pirinç (haşlanmış)|137|2.9|28.6|1.1|1.3||
curated_patates_haslanmis|Patates (haşlanmış)|71.6|1.6|15.2|0.2|2.2|150|
curated_patates_firin_sade|Patates (fırında, sade)|85|1.9|18|0.2|2.6|130|
curated_nohut_haslanmis|Nohut (haşlanmış, sade)|139.2|7.8|17.2|2.2|5.1||
curated_mercimek_haslanmis|Mercimek (haşlanmış, sade)|134.2|10.8|17.5|0.7|4.5||
curated_fasulye_haslanmis|Kuru Fasulye (haşlanmış, sade)|133.2|8.4|24|0.6|6.1||
curated_somon_haslanmis|Somon (fırın/haşlanmış, sade)|218.9|21.5|0|14.1|0||
curated_ton_salamura|Ton Balığı (suda, süzülmüş)|116|25.5|0|0.8|0||
curated_yesil_mercimek_corba|Yeşil Mercimek Çorbası|62.2|3.1|7|1.8|3.4||
curated_balkabagi_corba|Balkabağı Çorbası|46.6|0.7|5.4|2.4|0.8||
curated_kabak_corba|Kabak Çorbası|40.4|1.1|3.4|2.5|0.6||
curated_ispanak_corba|Ispanak Çorbası|51.8|1.9|6|2.4|0.8||
curated_patates_corba|Patates Çorbası|51|1|6.3|2.3|0.9||
curated_pirasa_corba|Pırasa Çorbası|46|0.5|6|2|0.9||
curated_sebzeli_tavuk_corba|Sebzeli Tavuk Çorbası|46.3|3.1|4.9|1.5|0.6||
curated_kremali_tavuk_corba|Kremalı Tavuk Çorbası|69.2|4|4.1|4|0.1||
curated_eksili_kofte_corba|Ekşili Köfte Çorbası|78.4|4.1|7.3|3.4|0.8||
curated_tutmac_corba|Tutmaç Çorbası|78.9|3|9.5|2.8|1.7||
curated_ovmac_corba|Ovmaç Çorbası|58.6|1.6|7.5|2.4|0.4||
curated_beyran|Beyran|72.9|4|7.2|3.1|0.2||
curated_lahana_corba|Lahana Çorbası|60.7|1.8|8.9|2.1|1.8||
curated_misir_corba|Mısır Çorbası|68.7|2|8.1|3.5|0.5||
curated_sade_bulgur_pilavi|Tereyağlı Bulgur Pilavı|168.6|3.3|25.8|5.1|4.6||
curated_domatesli_bulgur_pilavi|Domatesli Bulgur Pilavı|133.6|2.8|21.1|3.8|3.9||
curated_sehriyeli_bulgur_pilavi|Şehriyeli Bulgur Pilavı|164|3.4|25.4|4.8|3.9||
curated_domatesli_pilav|Domatesli Pirinç Pilavı|138.2|2.2|23.1|4|0.6||
curated_bezelyeli_pilav|Bezelyeli Pilav|144.9|2.7|23.7|4.2|1.2||
curated_tereyagli_makarna|Tereyağlı Makarna|193.2|3.5|31.1|5.7|1.3||
curated_elma_dilim_patates|Elma Dilim Patates (fırında)|142.2|1.7|16|7.6|2.3||
curated_haslanmis_sebze|Haşlanmış Sebze|32.7|1.8|5.2|0.3|2.2||
curated_izgara_sebze|Izgara Sebze|67.5|1.2|5.5|4.9|2.1||
curated_tereyagli_ispanak|Tereyağlı Ispanak|102|5.5|7.7|6.8|4.2||
curated_sebze_sote|Sebze Sote|78.3|1.8|6.1|5.6|1.7||
curated_lahana_salatasi|Lahana Salatası|79.9|1.1|6.2|6|2.3||
curated_pancar_salatasi|Pancar Salatası|103.9|1.3|8.6|6.9|1.3||
curated_sogan_salatasi|Maydanozlu Soğan Salatası|80.5|1.4|7.3|5|1.8||
curated_havuc_tarator|Yoğurtlu Havuç Tarator|108.6|2.8|7.4|7.7|1.4||
curated_sogus|Söğüş (domates, salatalık, biber)|17.9|0.8|4.1|0.2|1||
curated_sarimsakli_yogurt|Sarımsaklı Yoğurt|70.6|4.5|4.8|3.7|0||
curated_karisik_tursu|Karışık Turşu|14.7|0.4|1|0.3|3.3||
curated_tahin_pekmez|Tahin Pekmez|444|8.5|47.5|27|4.7||
curated_ay_cekirdegi_k|Ay Çekirdeği (iç, kavrulmuş)|582|19.3|13|49.8|11.1||`;
