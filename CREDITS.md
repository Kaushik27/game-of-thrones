# Credits & Image Licensing

This is an unofficial, non-commercial fan reference site for HBO's *Game of Thrones*.

## Cinematic realm artwork and interface assets

The Raven Wall observatory hero at `assets/generated/northern-guardian-observatory.png` is an
original AI-generated in-world study created for this fan project. It is not a photograph of an
actor, a production still, or an HBO asset. The house orbit uses the project's own line-art sigils;
the archive continues to label verified actor portraits separately inside dossiers.

The four realm backdrops in `assets/ui/` were generated specifically for this fan project, including
the dedicated Border / Wall visual. They are original atmospheric illustrations, not HBO production
stills or frames from the series.
Season summaries and episode links are curated in `js/realm-chapters.js`; each featured episode
links to its official HBO page.

The 3D layer uses [Three.js 0.180.0](https://threejs.org/) under the MIT License; the vendored
license is preserved at `vendor/THREE-LICENSE.txt`. Interface icons are from
[Bootstrap Icons 1.13.1](https://icons.getbootstrap.com/) under the MIT License; that license is
preserved at `assets/icons/BOOTSTRAP-ICONS-LICENSE.txt`.

## Actor photographs

The site uses **134 photographs of the real actors**: 133 sourced from
[Wikimedia Commons](https://commons.wikimedia.org/) and one frame published by the rights holder on
YouTube under CC BY. No publicity stills, IMDb images, or arbitrary web-search images are used.

Only these licenses were accepted: **CC0, Public Domain, CC BY (any version), CC BY-SA (any version)**. 
Anything non-free, fair-use, all-rights-reserved, or lacking license metadata was rejected.

License breakdown:

- CC BY 2.0 — 12 photos
- CC BY 3.0 — 16 photos
- CC BY 4.0 — 3 photos
- CC BY-SA 2.0 — 35 photos
- CC BY-SA 3.0 — 28 photos
- CC BY-SA 4.0 — 33 photos
- CC0 — 4 photos
- Public domain — 3 photos

CC BY and CC BY-SA require attribution. The full attribution list below is also rendered 
in the site itself at [`#/credits`](https://kaushik27.github.io/game-of-thrones/#/credits).

Photographs remain the copyright of their respective photographers.

### How these were collected

`tools/fetch_actor_photos.py` resolves each character's actor to their English Wikipedia article, 
requires that the article both describes a performer and mentions *Game of Thrones* (this is what 
prevents same-name collisions — e.g. the Australian MP Craig Kelly vs. the actor of the same name), 
then takes only that verified article's lead image or its Wikidata P18 image, and finally verifies
the source license against the allowlist. A small, explicitly reviewed set of Commons files and one
rights-holder CC BY video frame fills verified gaps. Characters with no qualifying open portrait are
drawn with the site's own generative SVG portrait art instead.

### Attributions

| Character | Actor | Photographer | License | Source |
| --- | --- | --- | --- | --- |
| Aerys II Targaryen | David Rintoul | John Thaxter ; derivative work by Eymery | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:David_Rintoul_(7_Avril_2009)_cropped.jpg) |
| Alliser Thorne | Owen Teale | Sam from UK | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Owen_Teale_2.jpg) |
| Archmaester Ebrose | Jim Broadbent | Scottish Documentary Institute | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Jim_Broadbent_2012.jpg) |
| Ser Arthur Dayne | Luke Roberts | Mateusz Malta | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Luke_Roberts_at_ComicCon_2026.jpg) |
| Arya Stark | Maisie Williams | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Maisie_Williams_by_Gage_Skidmore_3.jpg) |
| Balon Greyjoy | Patrick Malahide | Simon Richards | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Patrick_Malahide_in_2012.png) |
| Barristan Selmy | Ian McElhinney | Sam from UK | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ian_McElhinney_(cropped).jpg) |
| Benjen Stark | Joseph Mawle | Dublin International Film Festival | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Joseph_Mawle_in_Shell_2012.jpg) |
| Beric Dondarrion | Richard Dormer | nico fell photography from Northern Ireland | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Richard_Dormer_(2009)_(headshot).jpg) |
| Black Walder Frey | Tim Plester | Plesterdog | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Tim_Plester_2021.jpg) |
| Bowen Marsh | Clive Mantle | Philip Guest | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Clive_Mantle_(cropped).jpg) |
| Bran Stark | Isaac Hempstead Wright | Gage Skidmore | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Isaac_Hempstead_Wright_(2019)_(cropped).jpg) |
| Brienne of Tarth | Gwendoline Christie | Elena Ternovaja | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Gwendoline_Christie_at_Berlinale_2025.jpg) |
| Bronn | Jerome Flynn | dalekhelen | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Jerome_Flynn_2013_(cropped).jpg) |
| Brynden "Blackfish" Tully | Clive Russell | CelebHeights.com | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Clive-russell-2018_(cropped-J2).jpg) |
| Catelyn Stark | Michelle Fairley | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Michelle_Fairley_by_Gage_Skidmore_2.jpg) |
| Cersei Lannister | Lena Headey | Greg2600 | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Lena_Headey_(47086135862)_(cropped).jpg) |
| Daario Naharis | Michiel Huisman | Sebahed at English Wikipedia | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Michielhuisman2015_(cropped).jpg) |
| Daenerys Targaryen | Emilia Clarke | Vengerb3rg | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Emilia_Clarke_at_the_2023_Harper%27s_Bazaar_Women_of_the_Year_Awards.jpg) |
| Dagmer Cleftjaw | Ralph Ineson | Jamgoodman | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ralphinesonadjusted.jpg) |
| Davos Seaworth | Liam Cunningham | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Liam_Cunningham_by_Gage_Skidmore_3.jpg) |
| Dickon Tarly | Tom Hopper | Miguel Discart | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Tom_Hopper_Brussels_Comiccon_2022_(cropped).jpg) |
| Ser Dontos Hollard | Tony Way | Barnosaur | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Tony_Way_Speaking_at_ACME_Comic_Con_Spring_2022.jpg) |
| Doran Martell | Alexander Siddig | gdcgraphics | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:AlexanderSiddig09TIFF.jpg) |
| Doreah | Roxanne McKee | Elspeth Renfrew | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Roxane_McKee.jpg) |
| Eddard "Ned" Stark | Sean Bean | Bryan Berlin | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Sean_Bean_Anemone-25_(cropped).jpg) |
| Eddison "Dolorous Edd" Tollett | Ben Crompton | German Film &amp; Comic Con | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ben_Crompton_GFCC_Babelsberg_2024.jpg) |
| Edmure Tully | Tobias Menzies | Christine Ring | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Outlander_premiere_episode_screening_at_92nd_Street_Y_in_New_York_17_(crop).jpg) |
| Ellaria Sand | Indira Varma | Raboe001 | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Stuttgart_2022_-Comic_Con_Germany-Indira_Varma-_by-RaBoe_001_(cropped).jpg) |
| Euron Greyjoy | Pilou Asbæk | Amy Martin Photography | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Pilou_Asb%C3%A6k_2025.jpg) |
| Gendry Baratheon | Joe Dempsie | Estellecht | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Joe_Dempsie_Paris_2018_(cropped-J1).jpg) |
| Gilly | Hannah Murray | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Hannah_Murray_by_Gage_Skidmore.jpg) |
| Grand Maester Pycelle | Julian Glover | Patrick Subotkiewiez | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Julian_Glover_2014.jpg) |
| Gregor Clegane | Hafþór Júlíus Björnsson | Paula R. Lively from Zanesville | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Bj%C3%B6rnsson_Arnold_Classic_2017_(cropped_2).jpg) |
| Grey Worm | Jacob Anderson | Kevin Paul | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Jacob_Anderson_at_San_Diego_Comic_Con_2026.jpg) |
| Harry Strickland | Marc Rissmann | Ana Ularu | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Marc_Rissmann.jpg) |
| Hizdahr zo Loraq | Joel Fry | Steve Bowbrick | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Joel_Fry_in_February_2017_(cropped).jpg) |
| Hodor (Wylis) | Kristian Nairn | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Kristian_Nairn_by_Gage_Skidmore_3.jpg) |
| Illyrio Mopatis | Roger Allam | Sonnenuntergang | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Roger_Allam_La_Cage_120909_DSCF1622.JPG) |
| Ilyn Payne | Wilko Johnson | Roxette~jawiki at Japanese Wikipedia | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Wilko_Johnson_01.jpg) |
| Irri | Amrita Acharia | wizardradiomedia | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Amrita_Acharia_at_Triforce_SFF_Awards_2014.jpg) |
| Izembaro | Richard E. Grant | Greg2600 | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Richard_E._Grant_2018_(edited).jpg) |
| Jaime Lannister | Nikolaj Coster-Waldau | Harald Krichel | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Nikolaj_Coster-Waldau-68363.jpg) |
| Jaqen H'ghar | Tom Wlaschiha | Miguel Discart | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Tom_Wlaschiha_Holland_2023.jpg) |
| Janos Slynt | Dominic Carter | David Shankbone | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Dominic_Carter_by_David_Shankbone.jpg) |
| Jeor Mormont | James Cosmo | James English | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:James_Cosmo_2023.png) |
| Joffrey Baratheon | Jack Gleeson | Miguel Discart &amp; Kiri Karma (Photos Vrac) | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:2023-04-29_18-12-54_ILCE-7C_DSC15799_Kiri_DxO.jpg) |
| Jojen Reed | Thomas Brodie-Sangster | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Thomas_Brodie-Sangster_by_Gage_Skidmore_2.jpg) |
| Jon Snow | Kit Harington | Sachyn | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Kit_harrington_by_sachyn_mital_(cropped_2).jpg) |
| Jorah Mormont | Iain Glen | uberpixelphoto (Alan Chang) | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Iain_Glen.jpg) |
| Karl Tanner | Burn Gorman | David Johnson from Sheffield, England | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Burn_Gorman_2.jpg) |
| Karsi | Birgitte Hjort Sørensen | Greg2600 | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Birgitte_Hjort_S%C3%B8rensen_(30555295316)_(cropped).jpg) |
| Khal Drogo | Jason Momoa | Gage Skidmore | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Jason_Momoa_(43055621224)_(cropped).jpg) |
| Kinvara | Ania Bukstein | Sherban Lupu (שרבן לופו) | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ania_Bukstein_.jpg) |
| Lady Crane | Essie Davis | Harald Krichel | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Essie_Davis-67964.jpg) |
| Lancel Lannister | Eugene Simon | German Comic Con | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Eugene_simon_2020_1.jpg) |
| Leaf | Kae Alexander | German Comic Con | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Kae_alexander_2019_1.jpg) |
| Locke | Noah Taylor | GabboT | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Noah_Taylor_(29694898461).jpg) |
| Loras Tyrell | Finn Jones | Miguel Discart | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Finn_Jones_(53318496987).jpg) |
| Lothar Frey | Tom Brooke | Raph_PH | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:EmpireOfLightBFI121022_(29_of_33)_(52448303643)_(cropped).jpg) |
| Lyanna Mormont | Bella Ramsey | Harald Krichel | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Bella_Ramsey-3066.jpg) |
| Lyanna Stark | Aisling Franciosi | Martin Kraft | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:MJK_33393_Aisling_Franciosi_(Medienboard_Party_2019)_(cropped).jpg) |
| Lysa Arryn | Kate Dickie | Amy Martin Photography | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Kate_Dickie_2025.jpg) |
| Mace Tyrell | Roger Ashton-Griffiths | Roger Ashton-Griffiths | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Roger_Ashton-Griffiths_2023.jpg) |
| Maggy the Frog | Jodhi May | The Movie Blog | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Jodhi_May_The_Movie_Blog_2024.png) |
| Maester Cressen | Oliver Ford Davies | massattack05 from coventry, uk | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Oliver_Ford_Davies.jpg) |
| Maester Luwin | Donald Sumpter | Ian Smith from London, England | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Donald_Sumpter.jpg) |
| Mance Rayder | Ciarán Hinds | WelcomeScreenUK | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ciar%C3%A1n_Hinds_in_2022.jpg) |
| Margaery Tyrell | Natalie Dormer | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Natalie_Dormer_by_Gage_Skidmore_2.jpg) |
| Meera Reed | Ellie Kendrick | Malachi108 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ellie_Kendrick_in_2018.jpg) |
| Melisandre | Carice van Houten | Harald Krichel | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Carice_van_Houten_at_the_2026_Berlin_International_Film_Festival-60396.jpg) |
| Meryn Trant | Ian Beattie | Evamaria from Basel, Switzerland | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ian_Beattie.jpg) |
| Missandei | Nathalie Emmanuel | LucaFazPhoto | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Nathalie_Emmanuel_at_82nd_Venice_International_Film_Festival-3_(cropped).jpg) |
| Myrcella Baratheon | Nell Tiger Free | Amy Martin Photography | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Nell_Tiger_Free_2.jpg) |
| Nymeria Sand | Jessica Henwick | Girl Not on Fire | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Jessica_Henwick_at_an_interview_for_%27The_Royal_Hotel%27.png) |
| Obara Sand | Keisha Castle-Hughes | Sarah Said-1952 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Maori_women_at_BBQ.jpg) |
| Oberyn Martell | Pedro Pascal | Gabriel Hutchinson | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Pedro_Pascal_at_the_2025_Cannes_Film_Festival_04.jpg) |
| Olenna Tyrell | Diana Rigg | NBC Television | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Diana_Rigg_1973_Cropped.jpg) |
| Orell | Mackenzie Crook | Elyot Boudart | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Mackenzie_Crook_at_Series_Mania_2026_for_Small_Prophets.jpg) |
| Osha | Natalia Tena | Super Festivals from Ft. Lauderdale, USA | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Natalia_Tena_(29613976213).jpg) |
| Petyr "Littlefinger" Baelish | Aidan Gillen | Aidan Gillen | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Aidan_Gillen_Official.jpg) |
| Podrick Payne | Daniel Portman | German Comic Con | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Daniel_portman_2018_1.jpg) |
| Pyat Pree | Ian Hanmore | Caroline Rhea from Airdrie, UK, Scotland | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ian_Hanmore.jpg) |
| Pypar "Pyp" | Josef Altin | Elspeth Renfrew | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Josef_Altin.jpg) |
| Qyburn | Anton Lesser | Philip Vial | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Anton_Lesser_(2011).jpg) |
| Rakharo | Elyes Gabel | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Elyes_Gabel_by_Gage_Skidmore.jpg) |
| Ramsay Bolton | Iwan Rheon | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Iwan_Rheon_by_Gage_Skidmore.jpg) |
| Randyll Tarly | James Faulkner | CelebHeights.com | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:James-faulkner-2018.jpg) |
| Renly Baratheon | Gethin Anthony | German Comic Con | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Gethin_anthony_2019_2.jpg) |
| Rhaegar Targaryen | Wilf Scolding | German Comic Con | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Wilf_scolding_2021_1.jpg) |
| Rickon Stark | Art Parkinson | German Film &amp; Comic Con | CC BY 3.0 | [YouTube](https://www.youtube.com/watch?v=LpuR3AS-Vaw) |
| Robb Stark | Richard Madden | Gage Skidmore | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Richard_Madden_(48462874707)_(cropped).jpg) |
| Robert Baratheon | Mark Addy | Caporaletti1983 | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Mark_Addy.JPG) |
| Robett Glover | Tim McInnerny | eye4images | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Tim_McInnerny.jpg) |
| Robin Arryn | Lino Facioli | Lino Facioli | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Lino_Facioli_in_the_Park.jpg) |
| Rodrik Cassel | Ron Donachie | Nick Brooker | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ron_Donachie.jpg) |
| Roose Bolton | Michael McElhatton | MTV UK | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Michael_McElhatton,_circa_2018.jpg) |
| Ros | Esmé Bianco | Rabbitstalk | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Esm%C3%A9_Bianco_at_San_Diego_Comic_Con_2018.jpg) |
| Salladhor Saan | Lucian Msamati | jamie.minoprio | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Lucian_Msamati_(2010)_headshot.jpg) |
| Samwell Tarly | John Bradley | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:John_Bradley_by_Gage_Skidmore.jpg) |
| Sandor Clegane | Rory McCann | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Rory_McCann_in_2014_by_Gage_Skidmore.jpg) |
| Sansa Stark | Sophie Turner | Duk3L1xon | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Sophie_Turner_at_SXSW_London_June_2025_(cropped).jpg) |
| Selyse Baratheon | Tara Fitzgerald | Tracy Howl from London, UK | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Tara_Fitzgerald_(cropped).jpg) |
| Septa Unella | Hannah Waddingham | Harald Krichel | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Hannah_Waddingham-2790.jpg) |
| Septon Ray | Ian McShane | Raph_PH | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:McShaneTamLinRio311022_(1_of_21)_(52470810951)_(cropped_3%C3%974).jpg) |
| Shae | Sibel Kekilli | Harald Krichel | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Sibel_Kekilli-68503.jpg) |
| Shireen Baratheon | Kerry Ingram | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Kerry_Ingram_by_Gage_Skidmore.jpg) |
| Stannis Baratheon | Stephen Dillane | Tiphaine Buccino | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Stephen_Dillane_at_Dinard_2012.jpg) |
| Styr | Yuri Kolokolnikov | Mikhail Popov | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:%D0%9A%D0%BE%D0%BB%D0%BE%D0%BA%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2_%D0%AE%D1%80%D0%B8%D0%B9_%D0%90%D0%BD%D0%B4%D1%80%D0%B5%D0%B5%D0%B2%D0%B8%D1%87.jpg) |
| Syrio Forel | Miltos Yerolemou | Miguel Discart | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Miltos_Yerolemou_Brussels_Comic_Con_2018.jpg) |
| Talisa Stark | Oona Chaplin | Amy Martin Photography | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Oona_Chaplin_at_Avatar_fire_and_ash_premiere_London_2025.jpg) |
| The High Sparrow | Jonathan Pryce | Greg2600 | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Jonathan_Pryce_2016_(28577280662)_(cropped).jpg) |
| The Night King | Vladimir Furdik | Malachi108 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Vladimir_Fudrik_in_2018.jpg) |
| The Three-Eyed Raven | Max von Sydow | LJP assistant | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Max_von_Sydow_1992.jpg) |
| The Waif | Faye Marsay | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Faye_Marsay_by_Gage_Skidmore.jpg) |
| Theon Greyjoy | Alfie Allen | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Alfie_Allen_by_Gage_Skidmore_2.jpg) |
| Thoros of Myr | Paul Kaye | Malachi108 | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Paul_Kaye_in_2018.jpg) |
| Tommen Baratheon | Dean-Charles Chapman | Raboe001 | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Dean-Charles_Chapman_-_Comic_Con_Germany_2022_-_253_(cropped).jpg) |
| Tormund Giantsbane | Kristofer Hivju | Patrik Nygren | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Kristofer_Hivju_(Cropped,_2015).jpg) |
| Trystane Martell | Toby Sebastian | KARWAI TANG | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Toby-sebastian-arrives-for-the-world-premiere-of-game-of-news-photo-1579209210.jpg) |
| Tycho Nestoris | Mark Gatiss | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Mark_Gatiss_by_Gage_Skidmore_2.jpg) |
| Tyene Sand | Rosabell Laurenti Sellers | Claudia Celli Simi from Viterbo, Italia | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Rosabell_Laurenti_Sellers.jpg) |
| Tyrion Lannister | Peter Dinklage | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Peter_Dinklage_by_Gage_Skidmore_2.jpg) |
| Tywin Lannister | Charles Dance | Raph_PH | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:FrankensteinBFILFF131025-87_(54863424291)_(cropped).jpg) |
| Varys | Conleth Hill | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Conleth_Hill_by_Gage_Skidmore_3.jpg) |
| Viserys Targaryen | Harry Lloyd | Raboe001 | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Stuttgart_2023_-Comic_Con_Germany-_Harry_Lloyd-_by-RaBoe_034_(cropped).jpg) |
| Walda Bolton | Elizabeth Webster | German Comic Con | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Elizabeth_webster_gcc_2018.jpg) |
| Walder Frey | David Bradley | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:David_Bradley_by_Gage_Skidmore.jpg) |
| Wun Wun | Ian Whyte | CelebHeights.com | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ian-whyte-2018.jpg) |
| Xaro Xhoan Daxos | Nonso Anozie | Ibsan73 | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Nonso_Anozie_at_the_Pan_Premiere_(cropped).jpg) |
| Yara Greyjoy | Gemma Whelan | PPL Projects - www.pplphotography.nl | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Gemma_Whelan_(cropped).jpg) |
| Yezzan zo Qaggaz | Enzo Cilenti | GabboT | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Enzo_Cilenti_(29152188673).jpg) |
| Ygritte | Rose Leslie | Suzi Pratt | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Rose_Leslie_(March_2013)_(headshot).jpg) |
| Yohn Royce | Rupert Vansittart | Gage Skidmore | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Rupert_Vansittart_by_Gage_Skidmore.jpg) |

## Other assets

The Westeros map, all house sigils, the UI glyph set and the generative character portraits are 
original work created for this site. No official or third-party cartography or artwork is reused.

## Trademarks

*Game of Thrones*, *A Song of Ice and Fire*, their characters, house sigils and related imagery are 
the property of HBO and George R. R. Martin. This site is not affiliated with, endorsed by, or 
sponsored by HBO.
