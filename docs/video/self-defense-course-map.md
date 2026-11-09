# Self-defence course map (91-minute compilation)

Compilation video: https://www.youtube.com/watch?v=crp_bNCaPqE (5498 s, "Taekowndo - Self Defense").
Sources: chapter list `Videos/Taekowndo - Self Defense_[crp_bNCaPqE].txt`, the course notes (`taekowndo-Self-Defense-hosinsul/README.md`, `README.en.md`, `markdowns/*.md`) and the 69 clips in `videos/`.
The course uses Kukkiwon Revised Romanization (`jireugi`, `makgi`, `chagi`); the app and the club use older spellings. See `docs/kukkiwon-terminology.md` for the name mapping and for how every compound name below is decoded (section 5).

## 1. Does the compilation show the same things as the 69 files?

Yes. Checked with `ffprobe` and `ffmpeg`:

| Check | Result |
|---|---|
| Number of chapters | 69 in the chapter list = 69 `.mp4` files = 69 `.md` notes |
| Chapter length vs. file length | Every chapter length in the `.txt` is the file duration **truncated to whole seconds**: each file is 0.0-1.2 s longer than its chapter (32 of the 69 files are longer by more than 1 s) |
| Sum of durations | 69 files = 5537.1 s; chapter list and compilation = 5498 s (about 39 s less, the lost fractions of a second) |
| Picture at the start of each chapter | A frame taken 3 s into every `videos/NN.mp4` equals the frame at `chapter start + 3 s` in the compilation (mean absolute pixel difference 0 for 68 chapters, 0.5 of 255 for chapter 22) |
| Conclusion | The compilation is the 69 numbered clips concatenated in order, each clip with up to about 1 s of its tail cut. Start times can be used 1:1; leave a small margin at the end of a clip |

Last chapter (69) starts at 5418 s and ends at 5498 s. `endSec` of every other chapter is the start of the next one. Chapters are separated by cuts only; the compilation has no title cards between them.

## 2. Chapters

How cards are matched: `=` the clip demonstrates that card (same technique, only the romanization differs); `~` similar (same family, a detail or the exact variant differs, see the note in the row). Card ids are the app's `cardId`s: technique ids, form ids (`taeguk-1` to `taeguk-8`) and term ids (`training-nak-bop`, `training-ho-sin-sul`, `training-kyorugi`). Koryo to Ilyeo, the joint locks, throws, chokes and the weapon / ground defences have no card in the app yet.

| # | Start | Sec | Title | Content (from the file name) | Cards: `=` exact, `~` similar |
|---|---|---|---|---|---|
| | | | **Group 1: Basic techniques (01-08)** | | |
| 01 | 0:00:00 | 0 | Jireugi | Oenjumeogjireugi, Oreunjumeogjireugi, Dollyeojireugi *(Oen/oreun jumeok = left/right fist; dollyeo = turning punch. No zone is named, so the link to momtong jireugi is approximate.)* | `momtong-chirugi`~ |
| 02 | 0:00:34 | 34 | Chigi | Sonnalbakkatchigi, Muleupollyeochigi, Deungjumeogbakkatchigi, Muleupdollyeochigi, Batangsonapchigi, Imaapchigi *(Sonnal bakkat chigi is the OUTWARD hand-blade strike; the app card is the INWARD neck strike (see 12).)* | `hansonnal-mok-chicki`~ |
| 03 | 0:01:30 | 90 | Chagi | Apchagi, Dollyeochagi *(Ap chagi and dollyeo chagi: exact.)* | `ap-chagi`=, `dollyo-chagi`= |
| 04 | 0:01:55 | 115 | Makgi | Oenbatangsonanmakgi, Oreunsonnalbakkatmakgi, Oreunbatangsonanmakgi, Oenbatangsonnaeryeomakgi *(Batangson (palm heel) blocks have no card; sonnal bakkat makgi ~ momtong-hansonnal-packat-macki; naeryeo makgi ~ arae-macki.)* | `momtong-hansonnal-packat-macki`~, `momtong-an-macki`~, `arae-macki`~ |
| 05 | 0:02:28 | 148 | Ppaegi | OInward Teureoppaegi, Outward Teureoppaegi, Upward Teureoppaegi *(Pull-outs (ppaegi): no card.)* | - |
| 06 | 0:03:45 | 225 | Kkeokgi | Inside to outside to Biteureokkeokgi, Outside to inside to Biteureonulleokkeokgi, Outside to inside to Biteureokkeokgi, Inside to outside to Biteureonulleokkeokgi, Outside to inside to Biteureokkeokgi *(Joint locks (kkeokgi): no card.)* | - |
| 07 | 0:05:53 | 353 | Neomgigi | Leg Georeoneomgigi, Heolijabgodaligeoreoneomgigi, Leg Deureoneomgigi, Heoligeoreoneomgigi *(Throws (neomgigi): no card.)* | - |
| 08 | 0:07:46 | 466 | Joleugi | Anajoleugi, Yeopjoleugi *(Chokes (joleugi): no card.)* | - |
| | | | **Group 2: Falls and basic poomsae (09-26)** | | |
| 09 | 0:08:46 | 526 | Fall | Forward Fall, Side Fall, Backward Fall *(Breakfalls: club term nak-bop.)* | `training-nak-bop`~ |
| 10 | 0:10:02 | 602 | Taegeuk 1 Jang | Naeryeomakgi, Anmakgi, Torso Jireugi, Apchagi *(Naeryeo makgi = arae makgi; anmakgi = momtong an makgi; torso jireugi = momtong jireugi; apchagi.)* | `taeguk-1`=, `arae-macki`=, `momtong-an-macki`=, `momtong-chirugi`=, `ap-chagi`= |
| 11 | 0:11:49 | 709 | Taegeuk 2 Jang | Face ollyeomakgi *(Title says 'Face ollyeomakgi' = olgul makgi; the course note adds anmakgi, jireugi, apchagi.)* | `taeguk-2`=, `olgul-macki`=, `momtong-an-macki`~, `momtong-chirugi`~, `ap-chagi`~ |
| 12 | 0:13:41 | 821 | Taegeuk 3 Jang | Neck Sonnalanchigi, Sonnalbakkatmakgi *(Neck sonnal anchigi = hansonnal-mok-chicki (neck, inward). Sonnal bakkat makgi ~ the hand-blade outer block.)* | `taeguk-3`=, `hansonnal-mok-chicki`=, `momtong-hansonnal-packat-macki`~ |
| 13 | 0:15:26 | 926 | Taegeuk 4 Jang | Geodeureo Sonnalbakkatmakgii, Yeopchagi, Pyeonsonkkeut jjireugi, Bakkatmakgi, Jebipum anchigi, Deungjumeogapchigi *(Geodeureo sonnal bakkat makgi = the assisted hand-blade block; yeopchagi = yop-chagi; bakkatmakgi ~ momtong bakkat makgi.)* | `taeguk-4`=, `sonnal-momtong-kotoro-macki`=, `yop-chagi`=, `momtong-packat-macki`~ |
| 14 | 0:17:18 | 1038 | Taegeuk 5 Jang | Mejumeog naeryeochigi, Elbow Dollyeochigi, Elbow Pyojeogchigi *(Mejumeok naeryeochigi, elbow chigi: no card.)* | `taeguk-5`= |
| 15 | 0:19:23 | 1163 | Taegeuk 6 Jang | Biteuleomakgi, Dollyeochagi, Face Bakkatmakgi, Batangsonanmakgi *(Face bakkat makgi ~ olgul makgi (outward variant).)* | `taeguk-6`=, `dollyo-chagi`=, `olgul-macki`~ |
| 16 | 0:21:24 | 1284 | Taegeuk 7 Jang | Geodeuleosonnalnaeryeomakgi, Hechyeomakgi, Geodeureobatangsonanmakgi, Dujumeogjeojhyeojireugi, Gawimakgi, Eosgeoleonaeryeomakgi *(Geodeureo sonnal naeryeo makgi ~ hansonnal-arae-macki; other blocks have no card.)* | `taeguk-7`=, `hansonnal-arae-macki`~ |
| 17 | 0:23:34 | 1414 | Taegeuk 8 Jang | Dubaldangseongchagi, Danggyeojireugi, Geodeureobakkatmakgi, Geodeureonaeryeomakgi *(Geodeureo bakkat makgi = goduro-packat-palmok-packat-macki; dubal dangseong chagi: no card.)* | `taeguk-8`=, `goduro-packat-palmok-packat-macki`= |
| 18 | 0:25:43 | 1543 | Koryo | Geodeubchagi, Pyojeogjireugi, Eopeunsonnalbakkatchigi, Pyeonsonkkeutjeojhyeojjireugi, Ageumson Nullreokkeokgi, Batangsonnulreomakgi, Alaemejumeogpyojeogchigi, Elbow Yeopchigi | - |
| 19 | 0:27:56 | 1676 | Keumgang | Batangson apchigi, Santeulmakgi, Sonnalanmakgi, Keundoljjeogwi, Keumgangmakgi | - |
| 20 | 0:30:37 | 1837 | Taebaek | Low Sonnalhechyeomakgi, Sonnaleopeojabgi, Caught wrist Ppaegi, Torso Keumgangmakgi | - |
| 21 | 0:33:03 | 1983 | Pyongwon | Elbow Ollyeochigi, Face Geodeueoyeopmakgi, Danggyeodeungjumeogapchigi, Meongechigi | - |
| 22 | 0:35:33 | 2133 | Sipjin | Hwangsomakgi, Sonbadag geodeuleobakkatmakgi, Eopeunsonnalijjireugi | - |
| 23 | 0:38:24 | 2304 | Jitae | Sonnalollyeomakgi, Keumgangjireugi | - |
| 24 | 0:41:00 | 2460 | Chonkwon | Nalgaepyeogi, Keumgangyeopjireugi, Bamjumeogchijireugi, Taesanmilgi, Hwidulreomakgi, Balnaldeunganchagi, Hwidulreojabadanggigi | - |
| 25 | 0:43:32 | 2612 | Hansu | Sonnaldeunghechyeomakgi, Dumejumeoganchigi, SonnalKeumgangmakgi, Geodeureoageumsonapchigi | - |
| 26 | 0:45:46 | 2746 | Ilyeo | OesanteulYeopchagi, Twist and pull with both hands open, Ttwieoyeopchagi *(Oesanteul yeopchagi, ttwieo yeopchagi (jumping side kick) ~ yop-chagi, twio-chagi.)* | `yop-chagi`~, `twio-chagi`~ |
| | | | **Group 3: Situational self-defence (27-47)** | | |
| 27 | 0:48:12 | 2892 | Situational self Defense I | Counterattack on jireugi attack 1, Counterattack on jireugi attack 2, Defense on chagi attack *(Self-defence by situation (for 'more than 4 levels').)* | `training-ho-sin-sul`~ |
| 28 | 0:49:49 | 2989 | Situational self Defense I | Counterattack on jireugi attack 1, Counterattack on jireugi attack 2, Defense on chagi attack | `training-ho-sin-sul`~ |
| 29 | 0:51:20 | 3080 | Situational self Defense I | Counterattack on jireugi attack 1, Counterattack on jireugi attack 2, Defense on chagi attack | `training-ho-sin-sul`~ |
| 30 | 0:53:21 | 3201 | Situational self Defense II | Gyeorugi once 1 *(Gyeorugi once = probably one-step sparring (unverified).)* | `training-kyorugi`~ |
| 31 | 0:54:02 | 3242 | Situational self Defense II | Gyeorugi once 2 | `training-kyorugi`~ |
| 32 | 0:54:45 | 3285 | Situational self Defense II | Gyeorugi once 3 | `training-kyorugi`~ |
| 33 | 0:55:28 | 3328 | Situational self Defense II | Gyeorugi once 4 | `training-kyorugi`~ |
| 34 | 0:56:10 | 3370 | Situational self Defense II | Gyeorugi once 5 | `training-kyorugi`~ |
| 35 | 0:56:56 | 3416 | Situational self Defense II | Gyeorugi once 6 | `training-kyorugi`~ |
| 36 | 0:57:40 | 3460 | Situational self Defense II | Gyeorugi once 7 | `training-kyorugi`~ |
| 37 | 0:58:24 | 3504 | Situational self Defense II | Gyeorugi once 8 | `training-kyorugi`~ |
| 38 | 0:59:02 | 3542 | Situational self Defense II | Gyeorugi once 9 | `training-kyorugi`~ |
| 39 | 0:59:39 | 3579 | Situational self Defense II | Gyeorugi once 10 | `training-kyorugi`~ |
| 40 | 1:00:15 | 3615 | How to defend for knock over | Counterattack with kicking ham, Counterattack with turn over 1, Counterattack with turn over 2, Counterattack with pressing the nape of the back 1, Counterattack with pressing the nape of the back 2 *(Defence against weapons / ground situations (for 'more than 6 levels').)* | `training-ho-sin-sul`~ |
| 41 | 1:02:47 | 3767 | How to defend against lying position | Counterattack against strangled from above | `training-ho-sin-sul`~ |
| 42 | 1:03:53 | 3833 | Knife attack defense method I | Knife makgi | `training-ho-sin-sul`~ |
| 43 | 1:04:33 | 3873 | Knife attack defense method II | Counterattack when holding a knife on the left neck, Counterattack when putting a knife on the right neck, Counterattack when holding the body from behind and holding a knife around the neck | `training-ho-sin-sul`~ |
| 44 | 1:06:11 | 3971 | Knife attack defense method III | Counterattack when stabbing the abdomen 1, Counterattack when stabbing the abdomen 2 | `training-ho-sin-sul`~ |
| 45 | 1:07:15 | 4035 | Knife attack defense method IV | Counterattack when swinging diagonally 1, Counterattack when swinging sideways, Counterattack when swinging diagonally 2 | `training-ho-sin-sul`~ |
| 46 | 1:08:49 | 4129 | Lumber stick attack defense method | Counterattack against diagonal attacks 1, Counterattack against diagonal attacks 2, Counterattack against hitting from above | `training-ho-sin-sul`~ |
| 47 | 1:10:27 | 4227 | How to defend against a pistol | Counterattack when aimed by the gun from front, Counterattack when aimed by the gun from behind, Counterattack when aiming the gun from the side | `training-ho-sin-sul`~ |
| | | | **Group 4: Training and composition (48-69)** | | |
| 48 | 1:12:25 | 4345 | Basic operation | Jireugi, Chagi, Chigi, Neomgigi *(Basic drill: jireugi, chagi, chigi, neomgigi on both sides.)* | `momtong-chirugi`~ |
| 49 | 1:15:49 | 4549 | Hitting Training method level 1-4 | Jireugi, Dollyeojireugi, Chijireugi *(Pad drills.)* | `momtong-chirugi`~ |
| 50 | 1:16:53 | 4613 | Hitting Training method level 5 | Jireugi, Dollyeojireugi, Chijireugi | `momtong-chirugi`~ |
| 51 | 1:17:57 | 4677 | Hitting Training method level 6 | Jireugi, Dollyeojireugi | `momtong-chirugi`~ |
| 52 | 1:18:28 | 4708 | Hitting Training method level 7 | Jireugi, Chijireugi | `momtong-chirugi`~ |
| 53 | 1:18:59 | 4739 | Hitting Training method level 8 | Jireugi, Dollyeochagi | `momtong-chirugi`~, `dollyo-chagi`= |
| 54 | 1:19:31 | 4771 | Hitting Training method level 9 | Jireugi, Dollyeochagi | `momtong-chirugi`~, `dollyo-chagi`= |
| 55 | 1:20:03 | 4803 | Hitting Training method level 10 | Jireugi, Dollyeochagi, Dollyeojireugi | `momtong-chirugi`~, `dollyo-chagi`= |
| 56 | 1:20:41 | 4841 | Hitting Training method level 11 | Apchagi, Dollyeochagi, Dollyeojireugi | `ap-chagi`=, `dollyo-chagi`= |
| 57 | 1:21:19 | 4879 | Hitting Training method level 12 | Jireugi, Dwichagi, Bakkatchigi | `momtong-chirugi`~, `düt-chagi`= |
| 58 | 1:21:52 | 4912 | Hitting Training method level 13 | Dollyeochagi, Dwihuryeochagi, Bakkatchigi, Anchigi | `dollyo-chagi`=, `düt-chagi`~ |
| 59 | 1:22:27 | 4947 | Hitting Training method level 14 | Jireugi, Dollyeojireugi, Chijireugi, Dollyeochagi | `momtong-chirugi`~, `dollyo-chagi`= |
| 60 | 1:23:04 | 4984 | Hitting Training method level 15 | Anmakgi, Jireugi, Nalaechagi | `momtong-an-macki`=, `momtong-chirugi`~ |
| 61 | 1:23:36 | 5016 | Hitting Training method level 16 | Anmakgi, Jireugi, Chi-jireugi, Dollyeojireugi, Dwihuryeochagi | `momtong-an-macki`=, `momtong-chirugi`~, `düt-chagi`~ |
| 62 | 1:24:23 | 5063 | Composition | Basic training method 1poom | - |
| 63 | 1:25:06 | 5106 | Composition | Basic training method 2poom | - |
| 64 | 1:25:53 | 5153 | Composition | Basic training method 3poom | - |
| 65 | 1:26:44 | 5204 | Composition | Mitt training method 1poom | - |
| 66 | 1:27:25 | 5245 | Composition | Mitt training method 2poom | - |
| 67 | 1:28:09 | 5289 | Composition | Mitt training method 3poom | - |
| 68 | 1:28:57 | 5337 | Composition | Glove training method 4poom | - |
| 69 | 1:30:18 | 5418 | Composition | Basic training method, Tool training method | - |

## 3. Wiring data

`cardIds` lists exact and similar matches together (the table above says which is which). Times are seconds in the compilation.

```json
[
  {"n": 1, "startSec": 0, "endSec": 34, "title": "01. Jireugi", "cardIds": ["momtong-chirugi"]},
  {"n": 2, "startSec": 34, "endSec": 90, "title": "02. Chigi", "cardIds": ["hansonnal-mok-chicki"]},
  {"n": 3, "startSec": 90, "endSec": 115, "title": "03. Chagi", "cardIds": ["ap-chagi", "dollyo-chagi"]},
  {"n": 4, "startSec": 115, "endSec": 148, "title": "04. Makgi", "cardIds": ["momtong-hansonnal-packat-macki", "momtong-an-macki", "arae-macki"]},
  {"n": 5, "startSec": 148, "endSec": 225, "title": "05. Ppaegi", "cardIds": []},
  {"n": 6, "startSec": 225, "endSec": 353, "title": "06. Kkeokgi", "cardIds": []},
  {"n": 7, "startSec": 353, "endSec": 466, "title": "07. Neomgigi", "cardIds": []},
  {"n": 8, "startSec": 466, "endSec": 526, "title": "08. Joleugi", "cardIds": []},
  {"n": 9, "startSec": 526, "endSec": 602, "title": "09. Fall", "cardIds": ["training-nak-bop"]},
  {"n": 10, "startSec": 602, "endSec": 709, "title": "10. Taegeuk 1 Jang", "cardIds": ["taeguk-1", "arae-macki", "momtong-an-macki", "momtong-chirugi", "ap-chagi"]},
  {"n": 11, "startSec": 709, "endSec": 821, "title": "11. Taegeuk 2 Jang", "cardIds": ["taeguk-2", "olgul-macki", "momtong-an-macki", "momtong-chirugi", "ap-chagi"]},
  {"n": 12, "startSec": 821, "endSec": 926, "title": "12. Taegeuk 3 Jang", "cardIds": ["taeguk-3", "hansonnal-mok-chicki", "momtong-hansonnal-packat-macki"]},
  {"n": 13, "startSec": 926, "endSec": 1038, "title": "13. Taegeuk 4 Jang", "cardIds": ["taeguk-4", "sonnal-momtong-kotoro-macki", "yop-chagi", "momtong-packat-macki"]},
  {"n": 14, "startSec": 1038, "endSec": 1163, "title": "14. Taegeuk 5 Jang", "cardIds": ["taeguk-5"]},
  {"n": 15, "startSec": 1163, "endSec": 1284, "title": "15. Taegeuk 6 Jang", "cardIds": ["taeguk-6", "dollyo-chagi", "olgul-macki"]},
  {"n": 16, "startSec": 1284, "endSec": 1414, "title": "16. Taegeuk 7 Jang", "cardIds": ["taeguk-7", "hansonnal-arae-macki"]},
  {"n": 17, "startSec": 1414, "endSec": 1543, "title": "17. Taegeuk 8 Jang", "cardIds": ["taeguk-8", "goduro-packat-palmok-packat-macki"]},
  {"n": 18, "startSec": 1543, "endSec": 1676, "title": "18. Koryo", "cardIds": []},
  {"n": 19, "startSec": 1676, "endSec": 1837, "title": "19. Keumgang", "cardIds": []},
  {"n": 20, "startSec": 1837, "endSec": 1983, "title": "20. Taebaek", "cardIds": []},
  {"n": 21, "startSec": 1983, "endSec": 2133, "title": "21. Pyongwon", "cardIds": []},
  {"n": 22, "startSec": 2133, "endSec": 2304, "title": "22. Sipjin", "cardIds": []},
  {"n": 23, "startSec": 2304, "endSec": 2460, "title": "23. Jitae", "cardIds": []},
  {"n": 24, "startSec": 2460, "endSec": 2612, "title": "24. Chonkwon", "cardIds": []},
  {"n": 25, "startSec": 2612, "endSec": 2746, "title": "25. Hansu", "cardIds": []},
  {"n": 26, "startSec": 2746, "endSec": 2892, "title": "26. Ilyeo", "cardIds": ["yop-chagi", "twio-chagi"]},
  {"n": 27, "startSec": 2892, "endSec": 2989, "title": "27. Situational self Defense I", "cardIds": ["training-ho-sin-sul"]},
  {"n": 28, "startSec": 2989, "endSec": 3080, "title": "28. Situational self Defense I", "cardIds": ["training-ho-sin-sul"]},
  {"n": 29, "startSec": 3080, "endSec": 3201, "title": "29. Situational self Defense I", "cardIds": ["training-ho-sin-sul"]},
  {"n": 30, "startSec": 3201, "endSec": 3242, "title": "30. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 31, "startSec": 3242, "endSec": 3285, "title": "31. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 32, "startSec": 3285, "endSec": 3328, "title": "32. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 33, "startSec": 3328, "endSec": 3370, "title": "33. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 34, "startSec": 3370, "endSec": 3416, "title": "34. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 35, "startSec": 3416, "endSec": 3460, "title": "35. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 36, "startSec": 3460, "endSec": 3504, "title": "36. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 37, "startSec": 3504, "endSec": 3542, "title": "37. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 38, "startSec": 3542, "endSec": 3579, "title": "38. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 39, "startSec": 3579, "endSec": 3615, "title": "39. Situational self Defense II", "cardIds": ["training-kyorugi"]},
  {"n": 40, "startSec": 3615, "endSec": 3767, "title": "40. How to defend for knock over", "cardIds": ["training-ho-sin-sul"]},
  {"n": 41, "startSec": 3767, "endSec": 3833, "title": "41. How to defend against lying position", "cardIds": ["training-ho-sin-sul"]},
  {"n": 42, "startSec": 3833, "endSec": 3873, "title": "42. Knife attack defense method I", "cardIds": ["training-ho-sin-sul"]},
  {"n": 43, "startSec": 3873, "endSec": 3971, "title": "43. Knife attack defense method II", "cardIds": ["training-ho-sin-sul"]},
  {"n": 44, "startSec": 3971, "endSec": 4035, "title": "44. Knife attack defense method III", "cardIds": ["training-ho-sin-sul"]},
  {"n": 45, "startSec": 4035, "endSec": 4129, "title": "45. Knife attack defense method IV", "cardIds": ["training-ho-sin-sul"]},
  {"n": 46, "startSec": 4129, "endSec": 4227, "title": "46. Lumber stick attack defense method", "cardIds": ["training-ho-sin-sul"]},
  {"n": 47, "startSec": 4227, "endSec": 4345, "title": "47. How to defend against a pistol", "cardIds": ["training-ho-sin-sul"]},
  {"n": 48, "startSec": 4345, "endSec": 4549, "title": "48. Basic operation", "cardIds": ["momtong-chirugi"]},
  {"n": 49, "startSec": 4549, "endSec": 4613, "title": "49. Hitting Training method level 1-4", "cardIds": ["momtong-chirugi"]},
  {"n": 50, "startSec": 4613, "endSec": 4677, "title": "50. Hitting Training method level 5", "cardIds": ["momtong-chirugi"]},
  {"n": 51, "startSec": 4677, "endSec": 4708, "title": "51. Hitting Training method level 6", "cardIds": ["momtong-chirugi"]},
  {"n": 52, "startSec": 4708, "endSec": 4739, "title": "52. Hitting Training method level 7", "cardIds": ["momtong-chirugi"]},
  {"n": 53, "startSec": 4739, "endSec": 4771, "title": "53. Hitting Training method level 8", "cardIds": ["momtong-chirugi", "dollyo-chagi"]},
  {"n": 54, "startSec": 4771, "endSec": 4803, "title": "54. Hitting Training method level 9", "cardIds": ["momtong-chirugi", "dollyo-chagi"]},
  {"n": 55, "startSec": 4803, "endSec": 4841, "title": "55. Hitting Training method level 10", "cardIds": ["momtong-chirugi", "dollyo-chagi"]},
  {"n": 56, "startSec": 4841, "endSec": 4879, "title": "56. Hitting Training method level 11", "cardIds": ["ap-chagi", "dollyo-chagi"]},
  {"n": 57, "startSec": 4879, "endSec": 4912, "title": "57. Hitting Training method level 12", "cardIds": ["momtong-chirugi", "düt-chagi"]},
  {"n": 58, "startSec": 4912, "endSec": 4947, "title": "58. Hitting Training method level 13", "cardIds": ["dollyo-chagi", "düt-chagi"]},
  {"n": 59, "startSec": 4947, "endSec": 4984, "title": "59. Hitting Training method level 14", "cardIds": ["momtong-chirugi", "dollyo-chagi"]},
  {"n": 60, "startSec": 4984, "endSec": 5016, "title": "60. Hitting Training method level 15", "cardIds": ["momtong-an-macki", "momtong-chirugi"]},
  {"n": 61, "startSec": 5016, "endSec": 5063, "title": "61. Hitting Training method level 16", "cardIds": ["momtong-an-macki", "momtong-chirugi", "düt-chagi"]},
  {"n": 62, "startSec": 5063, "endSec": 5106, "title": "62. Composition", "cardIds": []},
  {"n": 63, "startSec": 5106, "endSec": 5153, "title": "63. Composition", "cardIds": []},
  {"n": 64, "startSec": 5153, "endSec": 5204, "title": "64. Composition", "cardIds": []},
  {"n": 65, "startSec": 5204, "endSec": 5245, "title": "65. Composition", "cardIds": []},
  {"n": 66, "startSec": 5245, "endSec": 5289, "title": "66. Composition", "cardIds": []},
  {"n": 67, "startSec": 5289, "endSec": 5337, "title": "67. Composition", "cardIds": []},
  {"n": 68, "startSec": 5337, "endSec": 5418, "title": "68. Composition", "cardIds": []},
  {"n": 69, "startSec": 5418, "endSec": 5498, "title": "69. Composition", "cardIds": []}
]
```

## 4. Notes and caveats

- The same technique appears in several chapters. For "show me `ap-chagi`" choose the first exact chapter (03), then the poomsae context (10, Taegeuk 1 Jang) and the pad drill (56).
- Chapters 10-17 are self-defence applications that reuse single moves of a poomsae (Course notes 10-17), not the whole poomsae.
- The course notes are short name lists plus one general paragraph per group; they do not describe stances or hand shapes.
- "Gyeorugi once 1-10" (30-39) is probably one-step sparring ("One-time Kyorugi", Kukkiwon textbook p.620). **unverified**
- Clips 49-61 are pad drills named by "level"; the names in brackets are the combinations used at that level.
- The similar (`~`) links for chapters 1, 2, 4 and 48-61 are approximate: the clip names say "Jireugi" or "Chigi" without naming the zone or direction used in the app's cards.
