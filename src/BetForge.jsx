import { useState, useEffect, useRef, useCallback } from "react"

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const TICK_SPEED     = 4000
const INITIAL_BAL    = 1000
const MAX_BET        = 500
const MIN_BET        = 10
const MAX_ACTIVE     = 4
const VIG            = 0.05
const ADMIN_PASSWORD = "admin"

const TEAMS = {
  P: {
    name: "Portugal", short: "POR", strength: 1.4, homeAdv: 1.2,
    color: "#1a7a1a", flag: "🟢",
    goalScorers: [
      { name: "Ronaldo", w: 0.40 }, { name: "B.Fernandes", w: 0.22 },
      { name: "B.Silva",  w: 0.15 }, { name: "Conceiçao",  w: 0.10 }, { name: "Other", w: 0.13 },
    ],
    freekick: [
      { name: "Ronaldo",    w: 0.60, ba: 0.80, conv: { short: 0.38, med: 0.32, long: 0.12 } },
      { name: "B.Fernandes",w: 0.30, ba: 0.45, conv: { short: 0.18, med: 0.14, long: 0.04 } },
      { name: "R.Neves",    w: 0.10, ba: 0.35, conv: { short: 0.12, med: 0.09, long: 0.03 } },
    ],
    corner: [
      { name: "B.Fernandes", w: 0.55, bonus: 1.20 },
      { name: "B.Silva",     w: 0.35, bonus: 1.10 },
      { name: "R.Neves",     w: 0.10, bonus: 1.00 },
    ],
    penalty: [
      { name: "Ronaldo",    w: 0.80, dir: { L: 0.35, C: 0.20, R: 0.45 }, sameP: 0.62, diffP: 0.92 },
      { name: "B.Fernandes",w: 0.15, dir: { L: 0.30, C: 0.25, R: 0.45 }, sameP: 0.48, diffP: 0.80 },
    ],
    gk: "D.Costa",
    gkDive: { L: 0.40, C: 0.10, R: 0.50 },
  },
  A: {
    name: "Argentina", short: "ARG", strength: 1.6, homeAdv: 1.0,
    color: "#1a3a7a", flag: "🔵",
    goalScorers: [
      { name: "Messi",      w: 0.42 }, { name: "Álvarez",     w: 0.25 },
      { name: "Di María",   w: 0.18 }, { name: "MacAllister", w: 0.08 }, { name: "Other", w: 0.07 },
    ],
    freekick: [
      { name: "Messi",   w: 0.65, ba: 0.75, conv: { short: 0.35, med: 0.28, long: 0.10 } },
      { name: "Di María",w: 0.25, ba: 0.50, conv: { short: 0.20, med: 0.16, long: 0.05 } },
      { name: "M.Allister",w: 0.10, ba: 0.30, conv: { short: 0.10, med: 0.08, long: 0.03 } },
    ],
    corner: [
      { name: "De Paul",  w: 0.60, bonus: 1.15 },
      { name: "Messi",    w: 0.25, bonus: 1.00 },
      { name: "Di María", w: 0.15, bonus: 1.00 },
    ],
    penalty: [
      { name: "Messi",   w: 0.75, dir: { L: 0.40, C: 0.15, R: 0.45 }, sameP: 0.60, diffP: 0.90 },
      { name: "Álvarez", w: 0.15, dir: { L: 0.45, C: 0.20, R: 0.35 }, sameP: 0.50, diffP: 0.82 },
      { name: "Di María",w: 0.10, dir: { L: 0.50, C: 0.10, R: 0.40 }, sameP: 0.52, diffP: 0.85 },
    ],
    gk: "E.Martínez",
    gkDive: { L: 0.35, C: 0.15, R: 0.50 },
  },
}

const USERS = [
    {
    "id": 1,
    "name": "Sakthi P",
    "username": "sakt",
    "password": "sakt3220",
    "email": "me250003067@iiti.ac.in"
  },
  {
    "id": 2,
    "name": "Aghil Krishna KP",
    "username": "aghi",
    "password": "aghi6351",
    "email": "aghilkrishna04@gmail.com"
  },
  {
    "id": 3,
    "name": "Suraj Yadav",
    "username": "sura",
    "password": "sura0849",
    "email": "suraj372y@gmail.com"
  },
  {
    "id": 4,
    "name": "Ritesh S",
    "username": "rite",
    "password": "rite7645",
    "email": "na23b028@smail.iitm.ac.in"
  },
  {
    "id": 5,
    "name": "Dhruv Kumar Jha",
    "username": "dhru",
    "password": "dhru6814",
    "email": "b24bs1132@iitj.ac.in"
  },
  {
    "id": 6,
    "name": "Dhanaraj K S",
    "username": "dhan",
    "password": "dhan7453",
    "email": "drj819@gmail.com"
  },
  {
    "id": 7,
    "name": "Vaibhav Mittal",
    "username": "vaib",
    "password": "vaib2303",
    "email": "2024uee0149@iitjammu.ac.in"
  },
  {
    "id": 8,
    "name": "Vineet Singla",
    "username": "vine",
    "password": "vine9584",
    "email": "vineet.singla.07@gmail.com"
  },
  {
    "id": 9,
    "name": "Nilay Khisty",
    "username": "nila",
    "password": "nila4519",
    "email": "nilaykhisty@gmail.com"
  },
  {
    "id": 10,
    "name": "Abhijeet Singh",
    "username": "abhi",
    "password": "abhi7265",
    "email": "abhijeetrsingh2006@gmail.com"
  },
  {
    "id": 11,
    "name": "Darsh Viradiya",
    "username": "dars",
    "password": "dars0712",
    "email": "darshviradiya01@gmail.com"
  },
  {
    "id": 12,
    "name": "Gauransh Gupta",
    "username": "gaur",
    "password": "gaur1187",
    "email": "guptagauransh06@gmail.com"
  },
  {
    "id": 13,
    "name": "Dev Shah",
    "username": "devs",
    "password": "devs6287",
    "email": "25je0885@iitism.ac.in"
  },
  {
    "id": 14,
    "name": "Sunny Panchal",
    "username": "sunn",
    "password": "sunn5064",
    "email": "sunny06.connect@gmail.com"
  },
  {
    "id": 15,
    "name": "SIDDHANT VERMA",
    "username": "sidd",
    "password": "sidd2939",
    "email": "sidmahimaverma@gmail.com"
  },
  {
    "id": 16,
    "name": "Falak Agrawal",
    "username": "fala",
    "password": "fala0265",
    "email": "falakagrawal8@gmail.com"
  },
  {
    "id": 17,
    "name": "Ashutosh Shivhare",
    "username": "ashu",
    "password": "ashu6671",
    "email": "kavascgcf@gmail.com"
  },
  {
    "id": 18,
    "name": "Harshith Gowda R",
    "username": "hars",
    "password": "hars0299",
    "email": "rharshithgowda2003@gmail.com"
  },
  {
    "id": 19,
    "name": "Samarth Yanjane",
    "username": "sama",
    "password": "sama0763",
    "email": "spyanjane_b25@ce.vjti.ac.in"
  },
  {
    "id": 20,
    "name": "Aditya",
    "username": "adit",
    "password": "adit0052",
    "email": "kabirsachdevaa@gmail.com"
  },
  {
    "id": 21,
    "name": "Karnati Sri Dattu",
    "username": "karn",
    "password": "karn3106",
    "email": "karnati_sd@cs.iitr.ac.in"
  },
  {
    "id": 22,
    "name": "shrey",
    "username": "shre",
    "password": "shre8424",
    "email": "shreyzhere@gmail.com"
  },
  {
    "id": 23,
    "name": "Krishika Goenka",
    "username": "kris",
    "password": "kris9800",
    "email": "krishika.goenka@gmail.com"
  },
  {
    "id": 24,
    "name": "Samar Goyal",
    "username": "sama",
    "password": "sama7597",
    "email": "samargoyal4564@gmail.com"
  },
  {
    "id": 25,
    "name": "Zubair Al Mamoon",
    "username": "zuba",
    "password": "zuba4696",
    "email": "jahanara.zubair@gmail.com"
  },
  {
    "id": 26,
    "name": "Agam Jot Singh",
    "username": "agam",
    "password": "agam0470",
    "email": "agamjot08@gmail.com"
  },
  {
    "id": 27,
    "name": "Aadrikaa Gupta",
    "username": "aadr",
    "password": "aadr6850",
    "email": "gupta.aadrikaa@gmail.com"
  },
  {
    "id": 28,
    "name": "Ayushi zala",
    "username": "ayus",
    "password": "ayus8171",
    "email": "agatezal094@gmail.com"
  },
  {
    "id": 29,
    "name": "Lokendra Kumar",
    "username": "loke",
    "password": "loke5298",
    "email": "ma23m008@smail.iitm.ac.in"
  },
  {
    "id": 30,
    "name": "Shakti Kumar Suraj",
    "username": "shak",
    "password": "shak4123",
    "email": "shakti.2025ug1097@iiitranchi.ac.in"
  },
  {
    "id": 31,
    "name": "Siddhesh Agarwal",
    "username": "sidd",
    "password": "sidd7771",
    "email": "siddheshbvbvpn0307@gmail.com"
  },
  {
    "id": 32,
    "name": "JasRaj",
    "username": "jasr",
    "password": "jasr1864",
    "email": "sjrjasraj9470@gmail.com"
  },
  {
    "id": 33,
    "name": "Kira",
    "username": "kira",
    "password": "kira0217",
    "email": "hit32334@gmail.com"
  },
  {
    "id": 34,
    "name": "Shivanadri Abhinav",
    "username": "shiv",
    "password": "shiv4614",
    "email": "abhinav_s3@ee.iitr.ac.in"
  },
  {
    "id": 35,
    "name": "Karthik Challagundla",
    "username": "kart",
    "password": "kart3266",
    "email": "karthikchallagundla18@gmail.com"
  },
  {
    "id": 36,
    "name": "Somya kumar",
    "username": "somy",
    "password": "somy5114",
    "email": "somya_k@cs.iitr.ac.in"
  },
  {
    "id": 37,
    "name": "Meet prajapati",
    "username": "meet",
    "password": "meet6162",
    "email": "meet_p@mt.iitr.ac.in"
  },
  {
    "id": 38,
    "name": "Tejas Agarwal",
    "username": "teja",
    "password": "teja3849",
    "email": "tejasagarwaliitg@gmail.com"
  },
  {
    "id": 39,
    "name": "Vasam Shobith",
    "username": "vasa",
    "password": "vasa9346",
    "email": "footballerhero1018@gmail.com"
  },
  {
    "id": 40,
    "name": "Shibam Mondal",
    "username": "shib",
    "password": "shib9936",
    "email": "shibamiit25@gmail.com"
  },
  {
    "id": 41,
    "name": "Ronak Chandak",
    "username": "rona",
    "password": "rona8493",
    "email": "ronak_c@me.iitr.ac.in"
  },
  {
    "id": 42,
    "name": "Ansh Bhutani",
    "username": "ansh",
    "password": "ansh7253",
    "email": "bhutaniansh08@gmail.com"
  },
  {
    "id": 43,
    "name": "Yuvraj",
    "username": "yuvr",
    "password": "yuvr6421",
    "email": "yuvrajydv6306@gmail.com"
  },
  {
    "id": 44,
    "name": "Rishiikesh S K",
    "username": "rish",
    "password": "rish7802",
    "email": "rishiikeshsk@gmail.com"
  },
  {
    "id": 45,
    "name": "Navdha Pandya",
    "username": "navd",
    "password": "navd9745",
    "email": "navdha_p@ch.iitr.ac.in"
  },
  {
    "id": 46,
    "name": "Harshita Aggarwal",
    "username": "hars",
    "password": "hars3967",
    "email": "harshita_a@ma.iitr.ac.in"
  },
  {
    "id": 47,
    "name": "Manvi Mehta",
    "username": "manv",
    "password": "manv6151",
    "email": "ug25cai017@iiitsurat.ac.in"
  },
  {
    "id": 48,
    "name": "Omshi Arora",
    "username": "omsh",
    "password": "omsh3350",
    "email": "aroraomshi2006@gmail.com"
  },
  {
    "id": 49,
    "name": "Srinivi",
    "username": "srin",
    "password": "srin5881",
    "email": "dsrinivi1901@gmail.com"
  },
  {
    "id": 50,
    "name": "Bhaskar Adhikari",
    "username": "bhas",
    "password": "bhas7202",
    "email": "probhaskar123@gmail.com"
  },
  {
    "id": 51,
    "name": "Prabhudutta Prusti",
    "username": "prab",
    "password": "prab5595",
    "email": "prabhudutta_2501mc37@iitp.ac.in"
  },
  {
    "id": 52,
    "name": "Atin Gupta",
    "username": "atin",
    "password": "atin1284",
    "email": "g.atin@iitg.ac.in"
  },
  {
    "id": 53,
    "name": "Ritesh Arora",
    "username": "rite",
    "password": "rite7626",
    "email": "ritesh_2501mc04@iitp.ac.in"
  },
  {
    "id": 54,
    "name": "Siddharth Aditya k",
    "username": "sidd",
    "password": "sidd8352",
    "email": "siddharthadityak@gmail.com"
  },
  {
    "id": 55,
    "name": "Pawani Mittal",
    "username": "pawa",
    "password": "pawa0840",
    "email": "pawanimittal007@gmail.com"
  },
  {
    "id": 56,
    "name": "Keyur Muliya",
    "username": "keyu",
    "password": "keyu5238",
    "email": "keyurmuliya9641@gmail.com"
  },
  {
    "id": 57,
    "name": "Arpit Verma",
    "username": "arpi",
    "password": "arpi0988",
    "email": "arpitverma26july@gmail.com"
  },
  {
    "id": 58,
    "name": "Chetan Singhal",
    "username": "chet",
    "password": "chet8811",
    "email": "singhalc29@gmail.com"
  },
  {
    "id": 59,
    "name": "Chinmay Choudhury",
    "username": "chin",
    "password": "chin7749",
    "email": "chinmay.davbdbl@gmail.com"
  },
  {
    "id": 60,
    "name": "CH SAMPATH SAI RAMA",
    "username": "chsa",
    "password": "chsa7711",
    "email": "sampathxsai@gmail.com"
  },
  {
    "id": 61,
    "name": "Chaitanyaa Vyas",
    "username": "chai",
    "password": "chai8346",
    "email": "chaitanyaavyas@gmail.com"
  },
  {
    "id": 62,
    "name": "Akshay Kumar",
    "username": "aksh",
    "password": "aksh6436",
    "email": "akshaykumarhudedmani@gmail.com"
  },
  {
    "id": 63,
    "name": "Kasak",
    "username": "kasa",
    "password": "kasa1284",
    "email": "kasak@ma.iitr.ac.in"
  },
  {
    "id": 64,
    "name": "Sahasra G",
    "username": "saha",
    "password": "saha3388",
    "email": "togandhesahasra@gmail.com"
  },
  {
    "id": 65,
    "name": "Varshini M",
    "username": "vars",
    "password": "vars5212",
    "email": "varshinim1604@gmail.com"
  },
  {
    "id": 66,
    "name": "Sarthak",
    "username": "sart",
    "password": "sart3267",
    "email": "sarthak_2501mc06@iitp.ac.in"
  },
  {
    "id": 67,
    "name": "Samarth Kansal",
    "username": "sama",
    "password": "sama3325",
    "email": "samarth_k1@me.iitr.ac.in"
  },
  {
    "id": 68,
    "name": "Parijat Ghosh",
    "username": "pari",
    "password": "pari4293",
    "email": "parijat_2501mm02@iitp.ac.in"
  },
  {
    "id": 69,
    "name": "Surisetti Adithya",
    "username": "suri",
    "password": "suri4737",
    "email": "adithyasurisetti9@gmail.com"
  },
  {
    "id": 70,
    "name": "Likhitha Konchada",
    "username": "likh",
    "password": "likh7577",
    "email": "konchada_l@ma.iitr.ac.in"
  },
  {
    "id": 71,
    "name": "Khushi Verma",
    "username": "khus",
    "password": "khus5180",
    "email": "kv.iitpatna25@gmail.com"
  },
  {
    "id": 72,
    "name": "Utkarsh",
    "username": "utka",
    "password": "utka1340",
    "email": "2024itb084.utkarsh@students.iiests.ac.in"
  },
  {
    "id": 73,
    "name": "Radhika Gupta",
    "username": "radh",
    "password": "radh8961",
    "email": "mt1240996@iitd.ac.in"
  },
  {
    "id": 74,
    "name": "Aaditya Saraf",
    "username": "aadi",
    "password": "aadi7004",
    "email": "aadityasaraf99@gmail.com"
  },
  {
    "id": 75,
    "name": "Suvrat Jain",
    "username": "suvr",
    "password": "suvr9688",
    "email": "suvratjain007op@gmail.com"
  },
  {
    "id": 76,
    "name": "Sappati Satya Sri Krishna Umesh",
    "username": "sapp",
    "password": "sapp6918",
    "email": "24je0922@iitism.ac.in"
  },
  {
    "id": 77,
    "name": "Shasak Arora",
    "username": "shas",
    "password": "shas3250",
    "email": "shasakarora@gmail.com"
  },
  {
    "id": 78,
    "name": "LAKSHIT SHARMA",
    "username": "laks",
    "password": "laks4086",
    "email": "lakshit.sharma@iitg.ac.in"
  },
  {
    "id": 79,
    "name": "Pushp Raj",
    "username": "push",
    "password": "push2529",
    "email": "he.is.pushp@gmail.com"
  },
  {
    "id": 80,
    "name": "Anvi Bansal",
    "username": "anvi",
    "password": "anvi0805",
    "email": "anvibansal.tech@gmail.com"
  },
  {
    "id": 81,
    "name": "ANKAN DEY",
    "username": "anka",
    "password": "anka6365",
    "email": "ankandey686@gmail.com"
  },
  {
    "id": 82,
    "name": "Ujjwal Deep",
    "username": "ujjw",
    "password": "ujjw5300",
    "email": "mail2ujjwaldeephzb@gmail.com"
  },
  {
    "id": 83,
    "name": "Anuj Kothari",
    "username": "anuj",
    "password": "anuj1530",
    "email": "che230008010@iiti.ac.in"
  },
  {
    "id": 84,
    "name": "yadavalli sandeep",
    "username": "yada",
    "password": "yada0706",
    "email": "yadavallisba2027@email.iimcal.ac.in"
  },
  {
    "id": 85,
    "name": "Mohit Somai",
    "username": "mohi",
    "password": "mohi0396",
    "email": "mohitsomai2007@gmail.com"
  },
  {
    "id": 86,
    "name": "Arpit Raj Bhagat",
    "username": "arpi",
    "password": "arpi0392",
    "email": "arpit_rb@ece.iitr.ac.in"
  },
  {
    "id": 87,
    "name": "GOHIL MAHIRAJSINH",
    "username": "gohi",
    "password": "gohi5150",
    "email": "ug25ece024@iiitsurat.ac.in"
  },
  {
    "id": 88,
    "name": "Sudhanshu Bajpai",
    "username": "sudh",
    "password": "sudh1069",
    "email": "sudhanshubajpai167@gmail.com"
  },
  {
    "id": 89,
    "name": "Parth Goyal",
    "username": "part",
    "password": "part4673",
    "email": "parth_s@ee.iitr.ac.in"
  },
  {
    "id": 90,
    "name": "Devyani Modi",
    "username": "devy",
    "password": "devy3391",
    "email": "devyani_m@hs.iitr.ac.in"
  },
  {
    "id": 91,
    "name": "Bhavna Adwani",
    "username": "bhav",
    "password": "bhav9285",
    "email": "adbhavna1369@gmail.com"
  },
  {
    "id": 92,
    "name": "Utkarsh Sahu",
    "username": "utka",
    "password": "utka5125",
    "email": "21f1001107@ds.study.iitm.ac.in"
  },
  {
    "id": 93,
    "name": "Darshan",
    "username": "dars",
    "password": "dars4717",
    "email": "djingar2006@gmail.com"
  },
  {
    "id": 94,
    "name": "ADITI SHARMA",
    "username": "adit",
    "password": "adit9228",
    "email": "aditi.25bcy10070@vitbhopal.ac.in"
  },
  {
    "id": 95,
    "name": "Arnav Nehete",
    "username": "arna",
    "password": "arna1953",
    "email": "arnavcodewiz@gmail.com"
  },
  {
    "id": 96,
    "name": "suraj prakash",
    "username": "sura",
    "password": "sura4771",
    "email": "rajyavanshi@gmail.com"
  },
  {
    "id": 97,
    "name": "Heet Nisar",
    "username": "heet",
    "password": "heet3236",
    "email": "heet.nisar.211292@gmail.com"
  },
  {
    "id": 98,
    "name": "Shashi haran ram vanam",
    "username": "shas",
    "password": "shas3471",
    "email": "shashiharanramvanam@gmail.com"
  },
  {
    "id": 99,
    "name": "Amrit Parashar",
    "username": "amri",
    "password": "amri7838",
    "email": "amritparashar2007@gmail.com"
  },
  {
    "id": 100,
    "name": "Hitansh Gandhi",
    "username": "hita",
    "password": "hita6493",
    "email": "hitansh_rg@cs.iitr.ac.in"
  },
  {
    "id": 101,
    "name": "SHARAD SINGH",
    "username": "shar",
    "password": "shar2478",
    "email": "sharad18022005@gmail.com"
  },
  {
    "id": 102,
    "name": "Bhanu Prakash S",
    "username": "bhan",
    "password": "bhan6875",
    "email": "bhanuprakashs357@gmail.com"
  },
  {
    "id": 103,
    "name": "DWARAKESH",
    "username": "dwar",
    "password": "dwar7534",
    "email": "haidwarakesh@gmail.com"
  },
  {
    "id": 104,
    "name": "Pulkit Singh",
    "username": "pulk",
    "password": "pulk7018",
    "email": "pulkit9453@gmail.com"
  },
  {
    "id": 105,
    "name": "harshit gupta",
    "username": "hars",
    "password": "hars5712",
    "email": "harshitonclouds@gmail.com"
  },
  {
    "id": 106,
    "name": "Rushan Raza",
    "username": "rush",
    "password": "rush1530",
    "email": "rushan_2501es20@iitp.ac.in"
  },
  {
    "id": 107,
    "name": "AYUSH KUMAR KUSHWAHA",
    "username": "ayus",
    "password": "ayus0485",
    "email": "ayushk.2024ug1020@iiitranchi.ac.in"
  },
  {
    "id": 108,
    "name": "Rishi Karthick S R",
    "username": "rish",
    "password": "rish5103",
    "email": "rishikarthick101@gmail.com"
  },
  {
    "id": 109,
    "name": "Soumik Chowdhury",
    "username": "soum",
    "password": "soum7476",
    "email": "soumik.chowdhury00@gmail.com"
  },
  {
    "id": 110,
    "name": "Sreesh Sundar",
    "username": "sree",
    "password": "sree2665",
    "email": "sreeshsundar61@gmail.com"
  },
  {
    "id": 111,
    "name": "Bassa Pavan venkata Raghava",
    "username": "bass",
    "password": "bass8913",
    "email": "pavanbassa111@gmail.com"
  },
  {
    "id": 112,
    "name": "Aditya Singh",
    "username": "adit",
    "password": "adit0732",
    "email": "aditsyntax@gmail.com"
  },
  {
    "id": 113,
    "name": "Mayank",
    "username": "maya",
    "password": "maya4357",
    "email": "mayank@hs.iitr.ac.in"
  },
  {
    "id": 114,
    "name": "aditya sood",
    "username": "adit",
    "password": "adit6469",
    "email": "aksood.02@gmail.com"
  },
  {
    "id": 115,
    "name": "abhay chauhan",
    "username": "abha",
    "password": "abha0170",
    "email": "abhaychauhan18983@gmail.com"
  },
  {
    "id": 116,
    "name": "Shivam Sharma",
    "username": "shiv",
    "password": "shiv7274",
    "email": "ss1167557@gmail.com"
  },
  {
    "id": 117,
    "name": "J Mukul",
    "username": "jmuk",
    "password": "jmuk7991",
    "email": "mukul_j@ma.iitr.ac.in"
  },
  {
    "id": 118,
    "name": "Varnika Srivastava",
    "username": "varn",
    "password": "varn8967",
    "email": "varnika_2501ce13@iitp.ac.in"
  },
  {
    "id": 119,
    "name": "Tokala mukunda preethi",
    "username": "toka",
    "password": "toka5679",
    "email": "tokal.mpreethi@gmail.com"
  },
  {
    "id": 120,
    "name": "Kavya Chaudhari",
    "username": "kavy",
    "password": "kavy9503",
    "email": "kavya2005additional@gmail.com"
  },
  {
    "id": 121,
    "name": "Sarthak Khot",
    "username": "sart",
    "password": "sart8518",
    "email": "sarthakkhot0593@gmail.com"
  },
  {
    "id": 122,
    "name": "Priyanshu Rana",
    "username": "priy",
    "password": "priy5815",
    "email": "priyanshu_r@es.iitr.ac.in"
  },
  {
    "id": 123,
    "name": "Yogender Singh",
    "username": "yoge",
    "password": "yoge2654",
    "email": "yogender1206@gmail.com"
  },
  {
    "id": 124,
    "name": "Sourav Sharma",
    "username": "sour",
    "password": "sour5778",
    "email": "souravs24@iiserb.ac.in"
  },
  {
    "id": 125,
    "name": "Anuj Pavan Sharma",
    "username": "anuj",
    "password": "anuj3153",
    "email": "anuj.p.sharma07@gmail.com"
  },
  {
    "id": 126,
    "name": "Pratham Kumar Gupta",
    "username": "prat",
    "password": "prat2137",
    "email": "k.pratham95@gmail.com"
  },
  {
    "id": 127,
    "name": "Gyanendra Nath Jha",
    "username": "gyan",
    "password": "gyan5564",
    "email": "gyanendranathjha4@gmail.com"
  },
  {
    "id": 128,
    "name": "Om Kumar",
    "username": "omku",
    "password": "omku7367",
    "email": "om_2501es18@iitp.ac.in"
  },
  {
    "id": 129,
    "name": "Devansh Bansal",
    "username": "deva",
    "password": "deva3790",
    "email": "bansalv843@gmail.com"
  },
  {
    "id": 130,
    "name": "Ansh Chitkara",
    "username": "ansh",
    "password": "ansh7047",
    "email": "anshchitkara19@gmail.com"
  },
  {
    "id": 131,
    "name": "Saurabh Kaushik",
    "username": "saur",
    "password": "saur9968",
    "email": "saurabhkaushik7642@gmail.com"
  },
  {
    "id": 132,
    "name": "Amoolya Sharan",
    "username": "amoo",
    "password": "amoo7729",
    "email": "amoolya_2503cb02@iitp.ac.in"
  },
  {
    "id": 133,
    "name": "sonu kumar",
    "username": "sonu",
    "password": "sonu1770",
    "email": "sonukumar08032007@gmail.com"
  },
  {
    "id": 134,
    "name": "Chodisetty Likitha Vaibhava Aasritha",
    "username": "chod",
    "password": "chod8383",
    "email": "chodisetty_2503es04@iitp.ac.in"
  },
  {
    "id": 135,
    "name": "SARTHAK TIBDEWAL",
    "username": "sart",
    "password": "sart2416",
    "email": "sarthakktibdewal@gmail.com"
  },
  {
    "id": 136,
    "name": "Vansh",
    "username": "vans",
    "password": "vans6151",
    "email": "vanshgupta55368@gmail.com"
  },
  {
    "id": 137,
    "name": "Shivam Gupta",
    "username": "shiv",
    "password": "shiv5424",
    "email": "shivamgupta85424@gmail.com"
  },
  {
    "id": 138,
    "name": "Abhishek Raj",
    "username": "abhi",
    "password": "abhi0117",
    "email": "rajabhi1863@gmail.com"
  },
  {
    "id": 139,
    "name": "Abhishek",
    "username": "abhi",
    "password": "abhi2592",
    "email": "abhishek1@mt.iitr.ac.in"
  },
  {
    "id": 140,
    "name": "Ved Bajaj",
    "username": "vedb",
    "password": "vedb2800",
    "email": "bajajved21@gmail.com"
  },
  {
    "id": 141,
    "name": "Swdha",
    "username": "swdh",
    "password": "swdh6218",
    "email": "swdha_g@cs.iitr.ac.in"
  },
  {
    "id": 142,
    "name": "Aman Hansda",
    "username": "aman",
    "password": "aman7312",
    "email": "amanhansda404@gmail.com"
  },
  {
    "id": 143,
    "name": "Abhinav Bindra",
    "username": "abhi",
    "password": "abhi5313",
    "email": "rishuseth76@gmail.com"
  },
  {
    "id": 144,
    "name": "Vidhaan Jain",
    "username": "vidh",
    "password": "vidh0484",
    "email": "vidhaan.jain16@gmail.com"
  },
  {
    "id": 145,
    "name": "viraj kadu",
    "username": "vira",
    "password": "vira6016",
    "email": "kadu.2025ug5044@iiitranchi.ac.in"
  },
  {
    "id": 146,
    "name": "Dipayan Nandi",
    "username": "dipa",
    "password": "dipa9783",
    "email": "ark4nandi@gmail.com"
  },
  {
    "id": 147,
    "name": "Vansh Singla",
    "username": "vans",
    "password": "vans4442",
    "email": "25msceco020@igidr.ac.in"
  },
  {
    "id": 148,
    "name": "Nayan Saraff",
    "username": "naya",
    "password": "naya2997",
    "email": "nayansaraff3739@gmail.com"
  },
  {
    "id": 149,
    "name": "Dhruvi Shah",
    "username": "dhru",
    "password": "dhru7341",
    "email": "007dhruvishah@gmail.com"
  },
  {
    "id": 150,
    "name": "KRISH",
    "username": "kris",
    "password": "kris4078",
    "email": "krish1@es.iitr.ac.in"
  },
  {
    "id": 151,
    "name": "Charul",
    "username": "char",
    "password": "char7300",
    "email": "charul1902@gmail.com"
  },
  {
    "id": 152,
    "name": "Savinaya K S",
    "username": "savi",
    "password": "savi9458",
    "email": "savi123ofmysore@gmail.com"
  },
  {
    "id": 153,
    "name": "Tanishka Srivastava",
    "username": "tani",
    "password": "tani7189",
    "email": "tanishka_s@cy.iitr.ac.in"
  },
  {
    "id": 154,
    "name": "Aditya Kumar",
    "username": "adit",
    "password": "adit3853",
    "email": "parallel9632universe@gmail.com"
  },
  {
    "id": 155,
    "name": "Preeti Mukherjee",
    "username": "pree",
    "password": "pree7207",
    "email": "25f3004794@ds.study.iitm.ac.in"
  },
  {
    "id": 156,
    "name": "shreya talari",
    "username": "shre",
    "password": "shre5639",
    "email": "shreyatalari325@gmail.com"
  },
  {
    "id": 157,
    "name": "Antorip Saha",
    "username": "anto",
    "password": "anto8077",
    "email": "saha2612antorip@gmail.com"
  },
  {
    "id": 158,
    "name": "Daisy Verma",
    "username": "dais",
    "password": "dais9972",
    "email": "daisy.eco0601@gmail.com"
  },
  {
    "id": 159,
    "name": "Hanmanth Nayak",
    "username": "hanm",
    "password": "hanm8793",
    "email": "hanmanthnayak.95@gmail.com"
  },
  {
    "id": 160,
    "name": "JASWANTH SAI",
    "username": "jasw",
    "password": "jasw3926",
    "email": "grandhi_js@cs.iitr.ac.in"
  },
  {
    "id": 161,
    "name": "Varun Kumar K",
    "username": "varu",
    "password": "varu5020",
    "email": "vkumark572@gmail.com"
  },
  {
    "id": 162,
    "name": "Parth Upman",
    "username": "part",
    "password": "part3701",
    "email": "parthupman1@gmail.com"
  },
  {
    "id": 163,
    "name": "Ashish Giri",
    "username": "ashi",
    "password": "ashi3705",
    "email": "ag107.8682u@gmail.com"
  },
  {
    "id": 164,
    "name": "GARV",
    "username": "garv",
    "password": "garv4208",
    "email": "garv@cs.iitr.ac.in"
  },
  {
    "id": 165,
    "name": "Pratik Kumar Pandey P",
    "username": "prat",
    "password": "prat0568",
    "email": "pratiksrdf@gmail.com"
  },
  {
    "id": 166,
    "name": "Naman Garg",
    "username": "nama",
    "password": "nama3670",
    "email": "naman23100@iiitnr.edu.in"
  },
  {
    "id": 167,
    "name": "Mahavis Alam",
    "username": "maha",
    "password": "maha0276",
    "email": "mehevis313@gmail.com"
  },
  {
    "id": 168,
    "name": "Mohit kumar",
    "username": "mohi",
    "password": "mohi1619",
    "email": "tiwarimohit384@gmail.com"
  },
  {
    "id": 169,
    "name": "Anadi",
    "username": "anad",
    "password": "anad2204",
    "email": "anadi2525@kgpian.iitkgp.ac.in"
  },
  {
    "id": 170,
    "name": "monodip malakar",
    "username": "mono",
    "password": "mono6002",
    "email": "monodipmalakar00@gmail.com"
  },
  {
    "id": 171,
    "name": "Ayush jha",
    "username": "ayus",
    "password": "ayus2904",
    "email": "ayush.90516401525@std.ggsipu.ac.in"
  },
  {
    "id": 172,
    "name": "Prince Gupta",
    "username": "prin",
    "password": "prin4068",
    "email": "prince.gupta.civ25@itbhu.ac.in"
  },
  {
    "id": 173,
    "name": "TAMMA SIVA SAI BHUVANA CHANDRA AGASTYA",
    "username": "tamm",
    "password": "tamm6770",
    "email": "tsivasai.bcagastya.ece25@itbhu.ac.in"
  },
  {
    "id": 174,
    "name": "Aryan kadam",
    "username": "arya",
    "password": "arya4656",
    "email": "aryan.vkadam.che25@itbhu.ac.in"
  },
  {
    "id": 175,
    "name": "Soumay Agarwal",
    "username": "soum",
    "password": "soum3311",
    "email": "soumay.sushilkagarwal.cse25@itbhu.ac.in"
  },
  {
    "id": 176,
    "name": "Hrushikesh Tayade",
    "username": "hrus",
    "password": "hrus2179",
    "email": "tayade.hrushikesh.eee25@itbhu.ac.in"
  },
  {
    "id": 177,
    "name": "Yash Gupta",
    "username": "yash",
    "password": "yash1384",
    "email": "yash.gupta.eee25@itbhu.ac.in"
  },
  {
    "id": 178,
    "name": "Vineet Anand",
    "username": "vine",
    "password": "vine0934",
    "email": "vineet.anand.ece25@itbhu.ac.in"
  },
  {
    "id": 179,
    "name": "Shreya Salhotra",
    "username": "shre",
    "password": "shre7334",
    "email": "shreya.salhotra.cse25@itbhu.ac.in"
  },
  {
    "id": 180,
    "name": "Bikram Barman",
    "username": "bikr",
    "password": "bikr3493",
    "email": "bikram.barman.che24@itbhu.ac.in"
  },
  {
    "id": 181,
    "name": "Aaradhya Nikam",
    "username": "aara",
    "password": "aara5266",
    "email": "aaradhyaanil.nikam.ece25@itbhu.ac.in"
  },
  {
    "id": 182,
    "name": "Vishwas Kushwaha",
    "username": "vish",
    "password": "vish0456",
    "email": "vishwas.kushwaha.mat25@itbhu.ac.in"
  },
  {
    "id": 183,
    "name": "Vedish mandloi",
    "username": "vedi",
    "password": "vedi4322",
    "email": "vedish.mandloi.ece25@itbhu.ac.in"
  },
  {
    "id": 184,
    "name": "Vikhyat Singh Phogat",
    "username": "vikh",
    "password": "vikh1178",
    "email": "vikhyatsingh.phogat.cse25@itbhu.ac.in"
  },
  {
    "id": 185,
    "name": "Sanket Nayak",
    "username": "sank",
    "password": "sank4735",
    "email": "sanket.nayak.cse25@itbhu.ac.in"
  },
  {
    "id": 186,
    "name": "Shravan Choudhary",
    "username": "shra",
    "password": "shra2802",
    "email": "choudhary.shravan.che25@itbhu.ac.in"
  },
  {
    "id": 187,
    "name": "Rajdeep Ghosh",
    "username": "rajd",
    "password": "rajd9620",
    "email": "rajdeep.ghosh.mat25@itbhu.ac.in"
  },
  {
    "id": 188,
    "name": "Aayush Sachan",
    "username": "aayu",
    "password": "aayu4722",
    "email": "aayush.sachan.mat24@itbhu.ac.in"
  },
  {
    "id": 189,
    "name": "Tufan Sannigrahi",
    "username": "tufa",
    "password": "tufa4426",
    "email": "tufan.sannigrahi.cse25@itbhu.ac.in"
  },
  {
    "id": 190,
    "name": "Armaan Saha",
    "username": "arma",
    "password": "arma5053",
    "email": "armaan.saha.che25@itbhu.ac.in"
  },
  {
    "id": 191,
    "name": "AKTA",
    "username": "akta",
    "password": "akta3161",
    "email": "akta.student.mat25@itbhu.ac.in"
  },
  {
    "id": 192,
    "name": "Ayush Kumar",
    "username": "ayus",
    "password": "ayus7696",
    "email": "ayush.kumar.cer25@itbhu.ac.in"
  },
  {
    "id": 193,
    "name": "DIVISHA ARORA",
    "username": "divi",
    "password": "divi9965",
    "email": "divisha.arora.che25@itbhu.ac.in"
  },
  {
    "id": 194,
    "name": "Ankit kumar Agrawal",
    "username": "anki",
    "password": "anki8082",
    "email": "ankitkr.agrawal.che24@itbhu.ac.in"
  },
  {
    "id": 195,
    "name": "PRIYANSHI DIXIT",
    "username": "priy",
    "password": "priy7387",
    "email": "priyanshi.dixit.phy23@itbhu.ac.in"
  },
  {
    "id": 196,
    "name": "Rishit Kulkarni",
    "username": "rish",
    "password": "rish6730",
    "email": "rishitg.kulkarni.met25@itbhu.ac.in"
  },
  {
    "id": 197,
    "name": "Nikhil Kumar",
    "username": "nikh",
    "password": "nikh6420",
    "email": "nikhil.kumar.cse25@itbhu.ac.in"
  },
  {
    "id": 198,
    "name": "Bishal Chakrabarty",
    "username": "bish",
    "password": "bish9860",
    "email": "bishal.chakrabarty.civ25@itbhu.ac.in"
  },
  {
    "id": 199,
    "name": "Darpan Rathi",
    "username": "darp",
    "password": "darp1939",
    "email": "darpan.rathi.cd.phy24@itbhu.ac.in"
  },
  {
    "id": 200,
    "name": "Tanmay Agrawal",
    "username": "tanm",
    "password": "tanm8099",
    "email": "tanmay.agrawal.cse25@itbhu.ac.in"
  },
  {
    "id": 201,
    "name": "yuvraj pancholi",
    "username": "yuvr",
    "password": "yuvr5508",
    "email": "yuvraj.pancholi.che25@itbhu.ac.in"
  },
  {
    "id": 202,
    "name": "Sarthak Singh",
    "username": "sart",
    "password": "sart9533",
    "email": "sarthak.singh.che25@itbhu.ac.in"
  },
  {
    "id": 203,
    "name": "Vivansh Jha",
    "username": "viva",
    "password": "viva0980",
    "email": "vivansh.jha.civ25@itbhu.ac.in"
  },
  {
    "id": 204,
    "name": "Prashasti Parvin Singh",
    "username": "pras",
    "password": "pras7689",
    "email": "prashasti.singh.che25@itbhu.ac.in"
  },
  {
    "id": 205,
    "name": "Ronak Gulecha",
    "username": "rona",
    "password": "rona8326",
    "email": "ronak.gulecha.che25@itbhu.ac.in"
  },
  {
    "id": 206,
    "name": "Darshiel Jain",
    "username": "dars",
    "password": "dars5775",
    "email": "darshiel.pjain.cer25@itbhu.ac.in"
  },
  {
    "id": 207,
    "name": "Divyanshu Jaiswal",
    "username": "divy",
    "password": "divy6884",
    "email": "divyanshu.jaiswal.ece24@itbhu.ac.in"
  },
  {
    "id": 208,
    "name": "Anvesh Potnuru",
    "username": "anve",
    "password": "anve4697",
    "email": "anvesh.potnuru.mec25@itbhu.ac.in"
  },
  {
    "id": 209,
    "name": "Atharva Rai",
    "username": "atha",
    "password": "atha7578",
    "email": "atharva.rai.mat24@itbhu.ac.in"
  },
  {
    "id": 210,
    "name": "Abhinav Anand",
    "username": "abhi",
    "password": "abhi1715",
    "email": "abhinav.anand.cse24@itbhu.ac.in"
  },
  {
    "id": 211,
    "name": "Nirbhik",
    "username": "nirb",
    "password": "nirb2775",
    "email": "nirbhik.kumawat.cse24@itbhu.ac.in"
  },
  {
    "id": 212,
    "name": "Yashmi Bhardwaj",
    "username": "yash",
    "password": "yash2656",
    "email": "yashmi.bhardwaj.che25@itbhu.ac.in"
  },
  {
    "id": 213,
    "name": "TANMAY ALMADI",
    "username": "tanm",
    "password": "tanm1206",
    "email": "tanmay.almadi.cse25@itbhu.ac.in"
  },
  {
    "id": 214,
    "name": "Krishna Vashishth",
    "username": "kris",
    "password": "kris5744",
    "email": "krishna.vashishth.chy24@itbhu.ac.in"
  },
  {
    "id": 215,
    "name": "KRISHNA LASYA DEVARA",
    "username": "kris",
    "password": "kris5208",
    "email": "devarakrishna.lasya.cse25@itbhu.ac.in"
  },
  {
    "id": 216,
    "name": "Nishtha Meratwal",
    "username": "nish",
    "password": "nish1881",
    "email": "nishtha.meratwal.civ25@itbhu.ac.in"
  },
  {
    "id": 217,
    "name": "Harsh Barhate",
    "username": "hars",
    "password": "hars8352",
    "email": "barhate.harsh.phy22@itbhu.ac.in"
  },
  {
    "id": 218,
    "name": "Vinit Yadav",
    "username": "vini",
    "password": "vini1776",
    "email": "yadav.vinitrajnath.chy25@itbhu.ac.in"
  },
  {
    "id": 219,
    "name": "Prisha Agarwal",
    "username": "pris",
    "password": "pris4707",
    "email": "prisha.pagarwal.cer25@itbhu.ac.in"
  },
  {
    "id": 220,
    "name": "Arnab Chakraborty",
    "username": "arna",
    "password": "arna7016",
    "email": "arnab.chakraborty.mec25@itbhu.ac.in"
  },
  {
    "id": 221,
    "name": "Kanhaiya Krishna Gupta",
    "username": "kanh",
    "password": "kanh1091",
    "email": "kanhaiyakrishna.gupta.phy22@itbhu.ac.in"
  },
  {
    "id": 222,
    "name": "Samyak Sambuddha",
    "username": "samy",
    "password": "samy9967",
    "email": "samyak.sambuddha.che25@itbhu.ac.in"
  },
  {
    "id": 223,
    "name": "Rajat Sahu",
    "username": "raja",
    "password": "raja8227",
    "email": "rajat.sahu.mec25@itbhu.ac.in"
  },
  {
    "id": 224,
    "name": "Dibyanshu Samal",
    "username": "diby",
    "password": "diby2379",
    "email": "dibyanshu.samal.eee25@itbhu.ac.in"
  },
  {
    "id": 225,
    "name": "Shashank Payyavula",
    "username": "shas",
    "password": "shas2878",
    "email": "payyavula.shashank.cse25@itbhu.ac.in"
  },
  {
    "id": 226,
    "name": "Anomitra Santra",
    "username": "anom",
    "password": "anom9641",
    "email": "anomitra.santra.mat24@itbhu.ac.in"
  },
  {
    "id": 227,
    "name": "Saatvik Dutta",
    "username": "saat",
    "password": "saat6922",
    "email": "saatvik.dsenapati.bme25@itbhu.ac.in"
  },
  {
    "id": 228,
    "name": "Ansh Mehrotra",
    "username": "ansh",
    "password": "ansh8865",
    "email": "ansh.mehrotra.mec25@itbhu.ac.in"
  },
  {
    "id": 229,
    "name": "Saksham Vijay",
    "username": "saks",
    "password": "saks1544",
    "email": "saksham.vijay.cer25@itbhu.ac.in"
  },
  {
    "id": 230,
    "name": "Sanjna Barnawal",
    "username": "sanj",
    "password": "sanj1754",
    "email": "sanjna.barnawal.ece25@itbhu.ac.in"
  },
  {
    "id": 231,
    "name": "HARSHIT TANEJA",
    "username": "hars",
    "password": "hars0014",
    "email": "harshit.taneja.mec24@itbhu.ac.in"
  },
  {
    "id": 232,
    "name": "Ashutosh Kumar",
    "username": "ashu",
    "password": "ashu8073",
    "email": "ashutosh.kumar.che25@itbhu.ac.in"
  },
  {
    "id": 233,
    "name": "vartika mishra",
    "username": "vart",
    "password": "vart0070",
    "email": "vartika.mishra.che25@itbhu.ac.in"
  },
  {
    "id": 234,
    "name": "Somay Agarwal",
    "username": "soma",
    "password": "soma2092",
    "email": "somay.agarwal.bme25@itbhu.ac.in"
  },
  {
    "id": 235,
    "name": "Aditya Aggarwal",
    "username": "adit",
    "password": "adit0156",
    "email": "aditya.aggarwal.eee25@itbhu.ac.in"
  },
  {
    "id": 236,
    "name": "Anant Singhal",
    "username": "anan",
    "password": "anan9700",
    "email": "anant.singhal.cer25@itbhu.ac.in"
  },
  {
    "id": 237,
    "name": "Debarghya Ghosh",
    "username": "deba",
    "password": "deba4194",
    "email": "debarghya.ghosh.eee25@itbhu.ac.in"
  },
  {
    "id": 238,
    "name": "Anushka Sarkar",
    "username": "anus",
    "password": "anus5985",
    "email": "anushka.sarkar.eee22@itbhu.ac.in"
  },
  {
    "id": 239,
    "name": "Arnav Raghuvanshi",
    "username": "arna",
    "password": "arna8807",
    "email": "arnav.raghuvanshi.mat24@itbhu.ac.in"
  },
  {
    "id": 240,
    "name": "Aditi Kamble",
    "username": "adit",
    "password": "adit4369",
    "email": "aditi.kamble.che22@itbhu.ac.in"
  },
  {
    "id": 241,
    "name": "Sachin Kumar",
    "username": "sach",
    "password": "sach7545",
    "email": "sachin.kumar.met24@itbhu.ac.in"
  },
  {
    "id": 242,
    "name": "Udhitha Boddepalli",
    "username": "udhi",
    "password": "udhi5217",
    "email": "udhitha.boddepalli.cse23@itbhu.ac.in"
  },
  {
    "id": 243,
    "name": "Ashirwad Mishra",
    "username": "ashi",
    "password": "ashi3583",
    "email": "ashirwad.mishra.cd.cse24@itbhu.ac.in"
  },
  {
    "id": 244,
    "name": "Madhavan Pankaj Srivastava",
    "username": "madh",
    "password": "madh8199",
    "email": "madhavan.psrivastava.met24@itbhu.ac.in"
  },
  {
    "id": 245,
    "name": "Sagnik Maity",
    "username": "sagn",
    "password": "sagn5105",
    "email": "sagnik.maity.min24@itbhu.ac.in"
  },
  {
    "id": 246,
    "name": "Geetanjali Pandey",
    "username": "geet",
    "password": "geet4473",
    "email": "geetanjali.pandey.che24@itbhu.ac.in"
  },
  {
    "id": 247,
    "name": "Urvashi Goyal",
    "username": "urva",
    "password": "urva3161",
    "email": "urvashi.goyal.eee22@itbhu.ac.in"
  },
  {
    "id": 248,
    "name": "Priyansha Bharti",
    "username": "priy",
    "password": "priy0268",
    "email": "priyansha.bharti.phe23@itbhu.ac.in"
  },
  {
    "id": 249,
    "name": "Ayushman Garg",
    "username": "ayus",
    "password": "ayus5022",
    "email": "ayushman.garg.mec20@itbhu.ac.in"
  },
  {
    "id": 250,
    "name": "Baddam Sri Sharith Reddy",
    "username": "badd",
    "password": "badd1275",
    "email": "bsrisharith.reddy.ece24@itbhu.ac.in"
  },
  {
    "id": 251,
    "name": "Yashvardhansinh Rayjada",
    "username": "yash",
    "password": "yash2729",
    "email": "r.yashvardhansinhp.mec23@itbhu.ac.in"
  },
  {
    "id": 252,
    "name": "DHRUV CHAUHAN",
    "username": "dhru",
    "password": "dhru7886",
    "email": "dhruv.chauhan.civ23@itbhu.ac.in"
  },
  {
    "id": 253,
    "name": "Kayala Sasi Vardhan",
    "username": "kaya",
    "password": "kaya3819",
    "email": "kayalasasi.vardhan.cse25@itbhu.ac.in"
  },
  {
    "id": 254,
    "name": "Harshit Anand",
    "username": "hars",
    "password": "hars7560",
    "email": "harshit.anand.cd.ece24@itbhu.ac.in"
  },
  {
    "id": 255,
    "name": "RENU K",
    "username": "renu",
    "password": "renu8816",
    "email": "renuk.bme25@itbhu.ac.in"
  },
  {
    "id": 256,
    "name": "Roshan kumar",
    "username": "rosh",
    "password": "rosh6820",
    "email": "roshan.kumar.mat25@itbhu.ac.in"
  },
  {
    "id": 257,
    "name": "Amit Kumar Das",
    "username": "amit",
    "password": "amit0255",
    "email": "amit.kdas.eee24@itbhu.ac.in"
  },
  {
    "id": 258,
    "name": "Aman Anand",
    "username": "aman",
    "password": "aman7823",
    "email": "aman.anand.mat25@itbhu.ac.in"
  },
  {
    "id": 259,
    "name": "Ojas Nakhale",
    "username": "ojas",
    "password": "ojas3015",
    "email": "nakhaleojas.nilesh.phy25@itbhu.ac.in"
  },
  {
    "id": 260,
    "name": "Harsh Singhvi",
    "username": "hars",
    "password": "hars5589",
    "email": "harsh.singhvi.eee25@itbhu.ac.in"
  },
  {
    "id": 261,
    "name": "Abhinav Gupta",
    "username": "abhi",
    "password": "abhi9353",
    "email": "abhinav.gupta.cse25@itbhu.ac.in"
  },
  {
    "id": 262,
    "name": "Abhinav Jaiswal",
    "username": "abhi",
    "password": "abhi3659",
    "email": "abhinav.jaiswal.eee22@itbhu.ac.in"
  },
  {
    "id": 263,
    "name": "Jay Ameta",
    "username": "jaya",
    "password": "jaya8166",
    "email": "jay.ameta.cse24@itbhu.ac.in"
  },
  {
    "id": 264,
    "name": "Satyajoy Das",
    "username": "saty",
    "password": "saty0497",
    "email": "satyajoy.das.cd.eee24@itbhu.ac.in"
  },
  {
    "id": 265,
    "name": "Bivan Patra",
    "username": "biva",
    "password": "biva7523",
    "email": "bivan.patra.phy25@itbhu.ac.in"
  },
  {
    "id": 266,
    "name": "rishi mishra",
    "username": "rish",
    "password": "rish5335",
    "email": "rishi.mishra.che25@itbhu.ac.in"
  },
  {
    "id": 267,
    "name": "Rohit Bachate",
    "username": "rohi",
    "password": "rohi2213",
    "email": "rohitvishnu.bachate.cse25@itbhu.ac.in"
  },
  {
    "id": 268,
    "name": "Niranjana K",
    "username": "nira",
    "password": "nira9919",
    "email": "niranjana.k.phe25@itbhu.ac.in"
  },
  {
    "id": 269,
    "name": "Kartik Gupta",
    "username": "kart",
    "password": "kart1744",
    "email": "kartik.gupta.che25@itbhu.ac.in"
  },
  {
    "id": 270,
    "name": "Kshamta Pandey",
    "username": "ksha",
    "password": "ksha4210",
    "email": "kshamtapandey.phe25@itbhu.ac.in"
  },
  {
    "id": 271,
    "name": "Aviral Shukla",
    "username": "avir",
    "password": "avir7907",
    "email": "aviral.shukla.mat24@itbhu.ac.in"
  },
  {
    "id": 272,
    "name": "Ayush chaurasia",
    "username": "ayus",
    "password": "ayus0625",
    "email": "ayush.chaurasia.apd24@itbhu.ac.in"
  },
  {
    "id": 273,
    "name": "Ashwini kumar",
    "username": "ashw",
    "password": "ashw4467",
    "email": "ashwini.kumar.mec24@itbhu.ac.in"
  },
  {
    "id": 274,
    "name": "Shivang Gupta",
    "username": "shiv",
    "password": "shiv9743",
    "email": "shivang.gupta.che25@itbhu.ac.in"
  },
  {
    "id": 275,
    "name": "Vaishnavi Agarwal",
    "username": "vais",
    "password": "vais6620",
    "email": "vaishnavi.agarwal.phe24@itbhu.ac.in"
  },
  {
    "id": 276,
    "name": "Spandan Kumar Mallik",
    "username": "span",
    "password": "span0789",
    "email": "spandan.kmallik.bce25@itbhu.ac.in"
  },
  {
    "id": 277,
    "name": "Tanmay Sharma",
    "username": "tanm",
    "password": "tanm4770",
    "email": "tanmay.sharma.eee19@itbhu.ac.in"
  },
  {
    "id": 278,
    "name": "Kanak Maru",
    "username": "kana",
    "password": "kana9290",
    "email": "kanak.maru.mat25@itbhu.ac.in"
  },
  {
    "id": 279,
    "name": "Hemank jindal",
    "username": "hema",
    "password": "hema7187",
    "email": "hemank.jindal.cse25@itbhu.ac.in"
  },
  {
    "id": 280,
    "name": "Arpit Gupta",
    "username": "arpi",
    "password": "arpi9151",
    "email": "arpit.gupta.mat25@itbhu.ac.in"
  },
  {
    "id": 281,
    "name": "Saurabh Kumar",
    "username": "saur",
    "password": "saur2984",
    "email": "saurabh.kumar.cd.che24@itbhu.ac.in"
  },
  {
    "id": 282,
    "name": "Riddhima Sabharwal",
    "username": "ridd",
    "password": "ridd6261",
    "email": "riddhima.sabharwal.mat25@itbhu.ac.in"
  },
  {
    "id": 283,
    "name": "Akshita Agarwal",
    "username": "aksh",
    "password": "aksh3413",
    "email": "akshita.agarwal.cse24@itbhu.ac.in"
  },
  {
    "id": 284,
    "name": "Madhav Aggarwal",
    "username": "madh",
    "password": "madh1503",
    "email": "madhav.aggarwal.cse25@itbhu.ac.in"
  },
  {
    "id": 285,
    "name": "Gagan",
    "username": "gaga",
    "password": "gaga2713",
    "email": "gagan.student.ece24@itbhu.ac.in"
  },
  {
    "id": 286,
    "name": "Debadrita Pal",
    "username": "deba",
    "password": "deba4335",
    "email": "debadrita.pal.cse25@itbhu.ac.in"
  },
  {
    "id": 287,
    "name": "Ashwathi M",
    "username": "ashw",
    "password": "ashw6468",
    "email": "ashwathi.m.phe25@itbhu.ac.in"
  },
  {
    "id": 288,
    "name": "Rajesh Kumar Dheeravath",
    "username": "raje",
    "password": "raje0505",
    "email": "dheeravath.rajeshkr.ece24@itbhu.ac.in"
  },
  {
    "id": 289,
    "name": "Ayush Gupta",
    "username": "ayus",
    "password": "ayus3673",
    "email": "ayush.gupta.che25@itbhu.ac.in"
  },
  {
    "id": 290,
    "name": "Harsh Kumar Gupta",
    "username": "hars",
    "password": "hars1258",
    "email": "harshkr.gupta.cd.che24@itbhu.ac.in"
  },
  {
    "id": 291,
    "name": "Sankalp Vats",
    "username": "sank",
    "password": "sank2423",
    "email": "sankalp.vats.che24@itbhu.ac.in"
  },
  {
    "id": 292,
    "name": "Ashmit Puranik",
    "username": "ashm",
    "password": "ashm9329",
    "email": "ashmit.puranik.che25@itbhu.ac.in"
  },
  {
    "id": 293,
    "name": "Manya Jain",
    "username": "many",
    "password": "many1068",
    "email": "manya.jain.mst25@itbhu.ac.in"
  },
  {
    "id": 294,
    "name": "Shivam Tekriwal",
    "username": "shiv",
    "password": "shiv1940",
    "email": "shivam.tekriwal.phe25@itbhu.ac.in"
  },
  {
    "id": 295,
    "name": "Arya Agrawal",
    "username": "arya",
    "password": "arya1227",
    "email": "aryagovind.agrawal.chy25@itbhu.ac.in"
  },
  {
    "id": 296,
    "name": "Saish Kadu",
    "username": "sais",
    "password": "sais1326",
    "email": "kadusaish.digambar.eee25@itbhu.ac.in"
  },
  {
    "id": 297,
    "name": "Vansh Gupta",
    "username": "vans",
    "password": "vans6197",
    "email": "vansh.gupta.ece25@itbhu.ac.in"
  },
  {
    "id": 298,
    "name": "Ayush Prakash",
    "username": "ayus",
    "password": "ayus9400",
    "email": "ayush.prakash.mec24@itbhu.ac.in"
  },
  {
    "id": 299,
    "name": "Vansh Gilhotra",
    "username": "vans",
    "password": "vans3251",
    "email": "vansh.gilhotra.min24@itbhu.ac.in"
  },
  {
    "id": 300,
    "name": "Sahil Ratna",
    "username": "sahi",
    "password": "sahi8166",
    "email": "sahil.ratna.mec25@itbhu.ac.in"
  },
  {
    "id": 301,
    "name": "Yash Dubey",
    "username": "yash",
    "password": "yash5720",
    "email": "yash.dubey.ece24@itbhu.ac.in"
  },
  {
    "id": 302,
    "name": "Kutubkhan Bhatiya",
    "username": "kutu",
    "password": "kutu7533",
    "email": "kutubkhan.hbhatiya.phy23@itbhu.ac.in"
  },
  {
    "id": 303,
    "name": "Litheesh Krishnan E",
    "username": "lith",
    "password": "lith7247",
    "email": "litheesh.krishnane.bce25@itbhu.ac.in"
  },
  {
    "id": 304,
    "name": "Arjun Morya",
    "username": "arju",
    "password": "arju9088",
    "email": "arjun.morya.cer24@itbhu.ac.in"
  },
  {
    "id": 305,
    "name": "Abhitosa Pradhan",
    "username": "abhi",
    "password": "abhi0820",
    "email": "abhitosa.pradhan.mec25@itbhu.ac.in"
  },
  {
    "id": 306,
    "name": "Ishant Singh",
    "username": "isha",
    "password": "isha1153",
    "email": "ishant.singh.che24@itbhu.ac.in"
  },
  {
    "id": 307,
    "name": "P.V.K.Sathwic",
    "username": "pvks",
    "password": "pvks3053",
    "email": "pvkarthikeya.sathwic.cse25@itbhu.ac.in"
  },
  {
    "id": 308,
    "name": "Aayush Kumar Sinha",
    "username": "aayu",
    "password": "aayu2319",
    "email": "aayushkr.sinha.mec25@itbhu.ac.in"
  },
  {
    "id": 309,
    "name": "UTKARSH KUMAR SINGH",
    "username": "utka",
    "password": "utka9247",
    "email": "utkarshkumar.singh.eee25@itbhu.ac.in"
  },
  {
    "id": 310,
    "name": "Sarvesh Deshpande",
    "username": "sarv",
    "password": "sarv3597",
    "email": "deshpande.sarvesh.phe22@itbhu.ac.in"
  },
  {
    "id": 311,
    "name": "M HARSHAVARDHAN REDDY",
    "username": "mhar",
    "password": "mhar6720",
    "email": "mharshavardhan.reddy.cse25@itbhu.ac.in"
  },
  {
    "id": 312,
    "name": "Hemanth",
    "username": "hema",
    "password": "hema6040",
    "email": "vankudoth.hemanth.mec22@itbhu.ac.in"
  },
  {
    "id": 313,
    "name": "Hitansh Aggarwal",
    "username": "hita",
    "password": "hita7977",
    "email": "hitansh.aggarwal.cse25@itbhu.ac.in"
  },
  {
    "id": 314,
    "name": "ganguly singh",
    "username": "gang",
    "password": "gang9481",
    "email": "ganguly.singh.bce21@itbhu.ac.in"
  },
  {
    "id": 315,
    "name": "Madhav Agrawal",
    "username": "madh",
    "password": "madh9612",
    "email": "madhav.agrawal.mst22@itbhu.ac.in"
  },
  {
    "id": 316,
    "name": "Naitik Jain",
    "username": "nait",
    "password": "nait7475",
    "email": "naitik.jain.civ25@itbhu.ac.in"
  },
  {
    "id": 317,
    "name": "Aditya Nimbalkar",
    "username": "adit",
    "password": "adit5554",
    "email": "aditya.pnimbalkar.che25@itbhu.ac.in"
  },
  {
    "id": 318,
    "name": "Aamod Menon",
    "username": "aamo",
    "password": "aamo9381",
    "email": "menonaamod.santosh.eee22@itbhu.ac.in"
  },
  {
    "id": 319,
    "name": "Shashwat",
    "username": "shas",
    "password": "shas3288",
    "email": "shashwat.student.civ25@itbhu.ac.in"
  },
  {
    "id": 320,
    "name": "Yashvardhan Singh",
    "username": "yash",
    "password": "yash8353",
    "email": "yashvardhan.singh.mec23@itbhu.ac.in"
  },
  {
    "id": 321,
    "name": "Moinak Mondal",
    "username": "moin",
    "password": "moin8127",
    "email": "moinak.mondal.mat24@itbhu.ac.in"
  },
  {
    "id": 322,
    "name": "Satyam Sinha",
    "username": "saty",
    "password": "saty1939",
    "email": "satyam.sinha.cd.phy23@itbhu.ac.in"
  },
  {
    "id": 323,
    "name": "Rajat Kumar Panda",
    "username": "raja",
    "password": "raja9865",
    "email": "rajatkumar.panda.eee25@itbhu.ac.in"
  },
  {
    "id": 324,
    "name": "Saksham Gupta",
    "username": "saks",
    "password": "saks9290",
    "email": "saksham.gupta.eee25@itbhu.ac.in"
  },
  {
    "id": 325,
    "name": "Arush Amit Moghe",
    "username": "arus",
    "password": "arus0396",
    "email": "arushamit.moghe.civ24@itbhu.ac.in"
  },
  {
    "id": 326,
    "name": "Devansh Gupta",
    "username": "deva",
    "password": "deva7007",
    "email": "devansh.gupta.mec25@itbhu.ac.in"
  },
  {
    "id": 327,
    "name": "Himanshu Sahoo",
    "username": "hima",
    "password": "hima3121",
    "email": "himanshu.sahoo.civ25@itbhu.ac.in"
  },
  {
    "id": 328,
    "name": "Ishan Singh",
    "username": "isha",
    "password": "isha9838",
    "email": "ishan.singh.che25@itbhu.ac.in"
  },
  {
    "id": 329,
    "name": "Rishabh Singh",
    "username": "rish",
    "password": "rish8916",
    "email": "rishabh.singh.che24@itbhu.ac.in"
  },
  {
    "id": 330,
    "name": "Akshat Agrawal",
    "username": "aksh",
    "password": "aksh6752",
    "email": "akshat.agrawal.bme25@itbhu.ac.in"
  },
  {
    "id": 331,
    "name": "Apoorva",
    "username": "apoo",
    "password": "apoo9236",
    "email": "apoorva.rajabhoj.met24@itbhu.ac.in"
  },
  {
    "id": 332,
    "name": "Praveen Marandi",
    "username": "prav",
    "password": "prav1891",
    "email": "praveen.marandi.met25@itbhu.ac.in"
  },
  {
    "id": 333,
    "name": "Madhav Sah",
    "username": "madh",
    "password": "madh2897",
    "email": "madhav.sah.cer25@itbhu.ac.in"
  },
  {
    "id": 334,
    "name": "Ishaan Anchan",
    "username": "isha",
    "password": "isha1331",
    "email": "ishaanjaya.anchan.mec25@itbhu.ac.in"
  },
  {
    "id": 335,
    "name": "Gaurav Kumar",
    "username": "gaur",
    "password": "gaur6640",
    "email": "gaurav.kumar.eee23@itbhu.ac.in"
  },
  {
    "id": 336,
    "name": "Aarnav Bhagat",
    "username": "aarn",
    "password": "aarn8092",
    "email": "aarnav.bhagat.min25@itbhu.ac.in"
  },
  {
    "id": 337,
    "name": "Avika Chauhan",
    "username": "avik",
    "password": "avik3404",
    "email": "avika.chauhan.cd.civ24@itbhu.ac.in"
  },
  {
    "id": 338,
    "name": "Shyamal",
    "username": "shya",
    "password": "shya0045",
    "email": "shyamal.student.civ25@itbhu.ac.in"
  },
  {
    "id": 339,
    "name": "Soham Dutt Pandey",
    "username": "soha",
    "password": "soha0838",
    "email": "sohamdutt.pandey.eee25@itbhu.ac.in"
  },
  {
    "id": 340,
    "name": "Anup Mall",
    "username": "anup",
    "password": "anup2552",
    "email": "anup.mall.met24@itbhu.ac.in"
  },
  {
    "id": 341,
    "name": "Satvik Sharma",
    "username": "satv",
    "password": "satv8084",
    "email": "satvik.sharma.mat25@itbhu.ac.in"
  },
  {
    "id": 342,
    "name": "Deepak Gangwar",
    "username": "deep",
    "password": "deep9675",
    "email": "deepak.gangwar.che25@itbhu.ac.in"
  },
  {
    "id": 343,
    "name": "Utkarsh Bhaskar",
    "username": "utka",
    "password": "utka8508",
    "email": "utkarsh.bhaskar.eee25@itbhu.ac.in"
  },
  {
    "id": 344,
    "name": "Krishna Saluja",
    "username": "kris",
    "password": "kris9694",
    "email": "krishna.saluja.mat25@itbhu.ac.in"
  },
  {
    "id": 345,
    "name": "Pranjal Choudhary",
    "username": "pran",
    "password": "pran7001",
    "email": "pranjal.rkchoudhary.cer25@itbhu.ac.in"
  },
  {
    "id": 346,
    "name": "pushkar srivastava",
    "username": "push",
    "password": "push6162",
    "email": "pushkar.srivastava.met25@itbhu.ac.in"
  },
  {
    "id": 347,
    "name": "Arhaan Ahmad",
    "username": "arha",
    "password": "arha3885",
    "email": "arhaan.ahmad.che25@itbhu.ac.in"
  },
  {
    "id": 348,
    "name": "Avneet Singh",
    "username": "avne",
    "password": "avne6469",
    "email": "avneet.singh.met25@itbhu.ac.in"
  },
  {
    "id": 349,
    "name": "Debtanay Sarkar",
    "username": "debt",
    "password": "debt2890",
    "email": "debtanay.sarkar.mat25@itbhu.ac.in"
  },
  {
    "id": 350,
    "name": "Piyush Maheshwari",
    "username": "piyu",
    "password": "piyu9884",
    "email": "piyush.maheshwari.che25@itbhu.ac.in"
  },
  {
    "id": 351,
    "name": "Jagat Pradip Das",
    "username": "jaga",
    "password": "jaga0573",
    "email": "jagatpradipdas.rs.mec25@itbhu.ac.in"
  },
  {
    "id": 352,
    "name": "Sahil Lohani",
    "username": "sahi",
    "password": "sahi5597",
    "email": "sahil.student.eee24@itbhu.ac.in"
  },
  {
    "id": 353,
    "name": "Divyesh Raniwal",
    "username": "divy",
    "password": "divy3803",
    "email": "divyesh.raniwal.cse25@itbhu.ac.in"
  },
  {
    "id": 354,
    "name": "Shyam Agrawal",
    "username": "shya",
    "password": "shya8695",
    "email": "shyam.agrawal.ece25@itbhu.ac.in"
  },
  {
    "id": 355,
    "name": "Versha Nishad",
    "username": "vers",
    "password": "vers0792",
    "email": "versha.nishad.che25@itbhu.ac.in"
  },
  {
    "id": 356,
    "name": "Dishant Sharma",
    "username": "dish",
    "password": "dish9717",
    "email": "dishant.sharma.mat24@itbhu.ac.in"
  },
  {
    "id": 357,
    "name": "Kanisk Kumar",
    "username": "kani",
    "password": "kani6497",
    "email": "kanisk.kumar.civ25@itbhu.ac.in"
  },
  {
    "id": 358,
    "name": "Kapil Saradhna",
    "username": "kapi",
    "password": "kapi4525",
    "email": "kapil.saradhna.phe24@itbhu.ac.in"
  },
  {
    "id": 359,
    "name": "Mohan Kumar",
    "username": "moha",
    "password": "moha6069",
    "email": "mohan.kumar.min22@itbhu.ac.in"
  },
  {
    "id": 360,
    "name": "Anushka",
    "username": "anus",
    "password": "anus7976",
    "email": "anushka.student.che25@itbhu.ac.in"
  },
  {
    "id": 361,
    "name": "Aayush Gupta",
    "username": "aayu",
    "password": "aayu9072",
    "email": "aayush.gupta.che24@itbhu.ac.in"
  },
  {
    "id": 362,
    "name": "Sarita Nemiwal",
    "username": "sari",
    "password": "sari8952",
    "email": "sarita.nemiwal.min25@itbhu.ac.in"
  },
  {
    "id": 363,
    "name": "Kanishka Gone",
    "username": "kani",
    "password": "kani3449",
    "email": "gone.kanishka.min25@itbhu.ac.in"
  },
  {
    "id": 364,
    "name": "Shubh Agrawal",
    "username": "shub",
    "password": "shub5556",
    "email": "shubh.agrawal.che25@itbhu.ac.in"
  },
  {
    "id": 365,
    "name": "Pranay Shukla",
    "username": "pran",
    "password": "pran4435",
    "email": "pranay.shukla.cse24@itbhu.ac.in"
  },
  {
    "id": 366,
    "name": "Ananya Prabhav",
    "username": "anan",
    "password": "anan6352",
    "email": "ananya.prabhav.cse25@itbhu.ac.in"
  },
  {
    "id": 367,
    "name": "Harshit Vaghamshi",
    "username": "hars",
    "password": "hars0443",
    "email": "vaghamshi.harshitv.cse24@itbhu.ac.in"
  },
  {
    "id": 368,
    "name": "Sriman bishnu prasad Satapathy",
    "username": "srim",
    "password": "srim9504",
    "email": "sbishnupd.satapathy.cse25@itbhu.ac.in"
  },
  {
    "id": 369,
    "name": "ARYAN V NAIR",
    "username": "arya",
    "password": "arya2370",
    "email": "aryan.vnair.ece25@itbhu.ac.in"
  },
  {
    "id": 370,
    "name": "Asmita Hargude",
    "username": "asmi",
    "password": "asmi0604",
    "email": "asmita.hargude.phy25@itbhu.ac.in"
  },
  {
    "id": 371,
    "name": "Sambhav kumar singh",
    "username": "samb",
    "password": "samb5161",
    "email": "sambhav.ksingh.che25@itbhu.ac.in"
  },
  {
    "id": 372,
    "name": "Yashwardhan Chaurasia",
    "username": "yash",
    "password": "yash3002",
    "email": "yashwardhan.chaurasia.che25@itbhu.ac.in"
  },
  {
    "id": 373,
    "name": "Akula Niharika",
    "username": "akul",
    "password": "akul5303",
    "email": "akula.niharika.min25@itbhu.ac.in"
  },
  {
    "id": 374,
    "name": "Harsh Singh",
    "username": "hars",
    "password": "hars3731",
    "email": "harsh.singh.mat25@itbhu.ac.in"
  },
  {
    "id": 375,
    "name": "Vivek Kumar Manjhi",
    "username": "vive",
    "password": "vive7530",
    "email": "vivekkumar.manjhi.met25@itbhu.ac.in"
  },
  {
    "id": 376,
    "name": "Vedant Gupta Shaw",
    "username": "veda",
    "password": "veda7967",
    "email": "vedantgupta.shaw.che25@itbhu.ac.in"
  },
  {
    "id": 377,
    "name": "Shristi Pal",
    "username": "shri",
    "password": "shri3251",
    "email": "shristi.pal.civ23@itbhu.ac.in"
  },
  {
    "id": 378,
    "name": "Ashish kumar",
    "username": "ashi",
    "password": "ashi1857",
    "email": "ashish.kumar.mst24@itbhu.ac.in"
  },
  {
    "id": 379,
    "name": "Sarvesh Pal",
    "username": "sarv",
    "password": "sarv6134",
    "email": "sarvesh.pal.mst24@itbhu.ac.in"
  },
  {
    "id": 380,
    "name": "Aditya Vinod Chougule",
    "username": "adit",
    "password": "adit9629",
    "email": "adityav.chougule.che25@itbhu.ac.in"
  },
  {
    "id": 381,
    "name": "Mahi",
    "username": "mahi",
    "password": "mahi9893",
    "email": "mahi.student.che25@itbhu.ac.in"
  },
  {
    "id": 382,
    "name": "Gaurav Kumar",
    "username": "gaur",
    "password": "gaur8319",
    "email": "gaurav.kumar.ece25@itbhu.ac.in"
  },
  {
    "id": 383,
    "name": "Siddharth C S",
    "username": "sidd",
    "password": "sidd0471",
    "email": "siddharth.cs.che25@itbhu.ac.in"
  },
  {
    "id": 384,
    "name": "Kanav",
    "username": "kana",
    "password": "kana0371",
    "email": "kanav.student.cse25@itbhu.ac.in"
  },
  {
    "id": 385,
    "name": "Aryan Rath",
    "username": "arya",
    "password": "arya9929",
    "email": "aryan.rath.min25@itbhu.ac.in"
  },
  {
    "id": 386,
    "name": "iedfa",
    "username": "iedf",
    "password": "iedf9793",
    "email": "arnavkumar.sinha.cse22@itbhu.ac.in"
  },
  {
    "id": 387,
    "name": "Pranav Agrawal",
    "username": "pran",
    "password": "pran7994",
    "email": "pranav.agrawal.min25@itbhu.ac.in"
  },
  {
    "id": 388,
    "name": "Maan Shah",
    "username": "maan",
    "password": "maan4440",
    "email": "shah.maan.che24@itbhu.ac.in"
  },
  {
    "id": 389,
    "name": "Ashwani Kumar",
    "username": "ashw",
    "password": "ashw8839",
    "email": "ashwani.kumar.eee25@itbhu.ac.in"
  },
  {
    "id": 390,
    "name": "Yakkanti Venkata Suresh Kumar Reddy",
    "username": "yakk",
    "password": "yakk5707",
    "email": "yvenkata.skreddy.cse25@itbhu.ac.in"
  },
  {
    "id": 391,
    "name": "Pragna Sri",
    "username": "prag",
    "password": "prag5766",
    "email": "kpragna.sri.met25@itbhu.ac.in"
  },
  {
    "id": 392,
    "name": "Charan Teja Madire",
    "username": "char",
    "password": "char5723",
    "email": "madirecharan.teja.mat25@itbhu.ac.in"
  },
  {
    "id": 393,
    "name": "Sarthak Rajesh Utture",
    "username": "sart",
    "password": "sart7725",
    "email": "sarthakrajeshutture.bce25@itbhu.ac.in"
  },
  {
    "id": 394,
    "name": "VISHNU ABHINAV",
    "username": "vish",
    "password": "vish4836",
    "email": "s.vishnuabhinav.met25@itbhu.ac.in"
  },
  {
    "id": 395,
    "name": "Mohit Burdak",
    "username": "mohi",
    "password": "mohi6477",
    "email": "mohit.burdak.eee25@itbhu.ac.in"
  },
  {
    "id": 396,
    "name": "Varikuppala Shashank",
    "username": "vari",
    "password": "vari6641",
    "email": "varikuppala.shashank.min25@itbhu.ac.in"
  },
  {
    "id": 397,
    "name": "Nandyala Vani",
    "username": "nand",
    "password": "nand9833",
    "email": "nandyala.vani.che22@itbhu.ac.in"
  },
  {
    "id": 398,
    "name": "Meet H Dand",
    "username": "meet",
    "password": "meet9269",
    "email": "meeth.dand.cd.civ24@itbhu.ac.in"
  },
  {
    "id": 399,
    "name": "Venkata Sai Sriram Jakkipelli",
    "username": "venk",
    "password": "venk1177",
    "email": "vssriram.jakkipelli.met25@itbhu.ac.in"
  },
  {
    "id": 400,
    "name": "Sankalp Gupta",
    "username": "sank",
    "password": "sank2090",
    "email": "sankalp.gupta.mat25@itbhu.ac.in"
  },
  {
    "id": 401,
    "name": "Manavi Laur",
    "username": "mana",
    "password": "mana5640",
    "email": "manavi.laur.cse25@itbhu.ac.in"
  },
  {
    "id": 402,
    "name": "Shourya Jaiswal",
    "username": "shou",
    "password": "shou6755",
    "email": "jaiswal.shourya.civ25@itbhu.ac.in"
  },
  {
    "id": 403,
    "name": "Aman Sahu",
    "username": "aman",
    "password": "aman1762",
    "email": "amans.sahu.mat25@itbhu.ac.in"
  },
  {
    "id": 404,
    "name": "Kandhi Anisha Rao",
    "username": "kand",
    "password": "kand3161",
    "email": "kandhianisha.rao.che25@itbhu.ac.in"
  },
  {
    "id": 405,
    "name": "Anuj Khichi",
    "username": "anuj",
    "password": "anuj7991",
    "email": "anuj.student.cse25@itbhu.ac.in"
  },
  {
    "id": 406,
    "name": "Satyak Pandey",
    "username": "saty",
    "password": "saty9824",
    "email": "satyak.pandey.mat25@itbhu.ac.in"
  },
  {
    "id": 407,
    "name": "Yash Diwakar Kohale",
    "username": "yash",
    "password": "yash5633",
    "email": "yashdiwakar.kohale.cse25@itbhu.ac.in"
  },
  {
    "id": 408,
    "name": "Advitya Khullar",
    "username": "advi",
    "password": "advi8526",
    "email": "advitya.khullar.civ25@itbhu.ac.in"
  },
  {
    "id": 409,
    "name": "Satyam Sharma",
    "username": "saty",
    "password": "saty0631",
    "email": "satyam.sharma.phe23@itbhu.ac.in"
  },
  {
    "id": 410,
    "name": "Samriddhi Agarwal",
    "username": "samr",
    "password": "samr2339",
    "email": "samriddhi.agarwal.min23@itbhu.ac.in"
  },
  {
    "id": 411,
    "name": "Sneha Garg",
    "username": "sneh",
    "password": "sneh5448",
    "email": "sneha.garg.civ25@itbhu.ac.in"
  },
  {
    "id": 412,
    "name": "Prem Solanke",
    "username": "prem",
    "password": "prem1872",
    "email": "premc.solanke.mec25@itbhu.ac.in"
  },
  {
    "id": 413,
    "name": "Prathmesh Jadhav",
    "username": "prat",
    "password": "prat2905",
    "email": "prathmesh.hjadhav.mec25@itbhu.ac.in"
  },
  {
    "id": 414,
    "name": "Vaishnavi",
    "username": "vais",
    "password": "vais6582",
    "email": "vaishnavi.ajaypal.mec25@itbhu.ac.in"
  },
  {
    "id": 415,
    "name": "Madhavan Saini",
    "username": "madh",
    "password": "madh3446",
    "email": "madhavan.saini.mat24@itbhu.ac.in"
  },
  {
    "id": 416,
    "name": "Sadanala Nandini Priya",
    "username": "sada",
    "password": "sada2155",
    "email": "snandini.priya.ece24@itbhu.ac.in"
  },
  {
    "id": 417,
    "name": "Prakhar Yadav",
    "username": "prak",
    "password": "prak0973",
    "email": "prakhar.yadav.min25@itbhu.ac.in"
  },
  {
    "id": 418,
    "name": "kriti pareek",
    "username": "krit",
    "password": "krit1173",
    "email": "kriti.pareek.cd.mst24@itbhu.ac.in"
  },
  {
    "id": 419,
    "name": "Divyani Saxena",
    "username": "divy",
    "password": "divy9880",
    "email": "divyani.saxena.che25@itbhu.ac.in"
  },
  {
    "id": 420,
    "name": "Ramnath T R",
    "username": "ramn",
    "password": "ramn2027",
    "email": "ramnath.tr.met25@itbhu.ac.in"
  },
  {
    "id": 421,
    "name": "Angel Yadav",
    "username": "ange",
    "password": "ange0507",
    "email": "angel.yadav.met25@itbhu.ac.in"
  },
  {
    "id": 422,
    "name": "ASHUTOSH CHATURVEDI",
    "username": "ashu",
    "password": "ashu5593",
    "email": "ashutosh.chaturvedi.eee23@itbhu.ac.in"
  },
  {
    "id": 423,
    "name": "Vivek Saxena",
    "username": "vive",
    "password": "vive0007",
    "email": "vivek.saxena.mec24@itbhu.ac.in"
  },
  {
    "id": 424,
    "name": "Yashika Gandhi",
    "username": "yash",
    "password": "yash3332",
    "email": "yashika.gandhi.mec25@itbhu.ac.in"
  },
  {
    "id": 425,
    "name": "Kaustubh Roy",
    "username": "kaus",
    "password": "kaus8064",
    "email": "kaustubh.kroy.cd.mec24@itbhu.ac.in"
  },
  {
    "id": 426,
    "name": "Ayush Kumar",
    "username": "ayus",
    "password": "ayus7996",
    "email": "ayush.kumar.ece25@itbhu.ac.in"
  },
  {
    "id": 427,
    "name": "Siddarth Bailkeri",
    "username": "sidd",
    "password": "sidd8065",
    "email": "siddarth.bailkeri.mat24@itbhu.ac.in"
  },
  {
    "id": 428,
    "name": "Manthan Kapkar",
    "username": "mant",
    "password": "mant8643",
    "email": "manthany.kapkar.ece24@itbhu.ac.in"
  },
  {
    "id": 429,
    "name": "Jitesh Kumar Mishra",
    "username": "jite",
    "password": "jite5929",
    "email": "jitesh.kmishra.cse24@itbhu.ac.in"
  },
  {
    "id": 430,
    "name": "Vikas gupta",
    "username": "vika",
    "password": "vika5287",
    "email": "vikas.gupta.che25@itbhu.ac.in"
  },
  {
    "id": 431,
    "name": "safdar hayat khan",
    "username": "safd",
    "password": "safd7259",
    "email": "safdar.hayatkhan.cse25@itbhu.ac.in"
  },
  {
    "id": 432,
    "name": "Sahil",
    "username": "sahi",
    "password": "sahi2802",
    "email": "sahil.student.chy25@itbhu.ac.in"
  },
  {
    "id": 433,
    "name": "Yash Kumar",
    "username": "yash",
    "password": "yash6497",
    "email": "yash.kumar.che25@itbhu.ac.in"
  },
  {
    "id": 434,
    "name": "DIPNITA GAUTAM",
    "username": "dipn",
    "password": "dipn2860",
    "email": "dipnita.gautam.che25@itbhu.ac.in"
  },
  {
    "id": 435,
    "name": "Shreyas B Patil",
    "username": "shre",
    "password": "shre2007",
    "email": "shreyasb.patil.ece25@itbhu.ac.in"
  },
  {
    "id": 436,
    "name": "Grisham Prateesh",
    "username": "gris",
    "password": "gris2790",
    "email": "grisham.prateesh.chy25@itbhu.ac.in"
  },
  {
    "id": 437,
    "name": "Pratham Verma",
    "username": "prat",
    "password": "prat2340",
    "email": "pratham.verma.met25@itbhu.ac.in"
  },
  {
    "id": 438,
    "name": "Vikas limanpure",
    "username": "vika",
    "password": "vika7940",
    "email": "vikas.limanpure.chy25@itbhu.ac.in"
  },
  {
    "id": 439,
    "name": "Udit Saxena",
    "username": "udit",
    "password": "udit4847",
    "email": "udit.saxena.phy25@itbhu.ac.in"
  },
  {
    "id": 440,
    "name": "Yashasvi Mahawar",
    "username": "yash",
    "password": "yash6978",
    "email": "yashasvi.mahawar.cse24@itbhu.ac.in"
  },
  {
    "id": 441,
    "name": "Sehajroop Singh",
    "username": "seha",
    "password": "seha9785",
    "email": "sehajroop.singh.phe24@itbhu.ac.in"
  },
  {
    "id": 442,
    "name": "Pratham Garg",
    "username": "prat",
    "password": "prat8220",
    "email": "pratham.garg.cse25@itbhu.ac.in"
  },
  {
    "id": 443,
    "name": "Athrey M",
    "username": "athr",
    "password": "athr4655",
    "email": "athrey.m.cse25@itbhu.ac.in"
  },
  {
    "id": 444,
    "name": "Suraj Srivastava",
    "username": "sura",
    "password": "sura4581",
    "email": "suraj.srivastava.min25@itbhu.ac.in"
  },
  {
    "id": 445,
    "name": "Pranav khandelwal",
    "username": "pran",
    "password": "pran9694",
    "email": "pranav.khandelwal.eee25@itbhu.ac.in"
  },
  {
    "id": 446,
    "name": "Shivam Choudhary",
    "username": "shiv",
    "password": "shiv7210",
    "email": "shivam.choudhary1.cse25@itbhu.ac.in"
  },
  {
    "id": 447,
    "name": "Shubhi Mishra",
    "username": "shub",
    "password": "shub3088",
    "email": "shubhi.mishra.mat24@itbhu.ac.in"
  },
  {
    "id": 448,
    "name": "Akash kumar",
    "username": "akas",
    "password": "akas4737",
    "email": "akashkumar.ram.ece25@itbhu.ac.in"
  },
  {
    "id": 449,
    "name": "Divyanshu",
    "username": "divy",
    "password": "divy3349",
    "email": "divyanshu.student.phy25@itbhu.ac.in"
  },
  {
    "id": 450,
    "name": "Vishal M",
    "username": "vish",
    "password": "vish9908",
    "email": "vishal.m.che25@itbhu.ac.in"
  },
  {
    "id": 451,
    "name": "Saptarshi Banerjee",
    "username": "sapt",
    "password": "sapt8328",
    "email": "saptarshi.banerjee.cd.cse24@itbhu.ac.in"
  },
  {
    "id": 452,
    "name": "Saksham Madan",
    "username": "saks",
    "password": "saks3514",
    "email": "saksham.madan.mat24@itbhu.ac.in"
  },
  {
    "id": 453,
    "name": "Yuvraj Kumar Choudhary",
    "username": "yuvr",
    "password": "yuvr7067",
    "email": "yuvrajk.choudhary.min25@itbhu.ac.in"
  },
  {
    "id": 454,
    "name": "Himanshu Jha",
    "username": "hima",
    "password": "hima1236",
    "email": "himanshu.jha.che25@itbhu.ac.in"
  },
  {
    "id": 455,
    "name": "Achyut Tripathi",
    "username": "achy",
    "password": "achy3533",
    "email": "achyut.tripathi.eee25@itbhu.ac.in"
  },
  {
    "id": 456,
    "name": "Diksha Upadhyay",
    "username": "diks",
    "password": "diks2709",
    "email": "dikshar.upadhyay.che25@itbhu.ac.in"
  },
  {
    "id": 457,
    "name": "Paturi Hemanth sai",
    "username": "patu",
    "password": "patu9216",
    "email": "paturi.hemanthsai.cse24@itbhu.ac.in"
  },
  {
    "id": 458,
    "name": "D Rahul Reddy",
    "username": "drah",
    "password": "drah6375",
    "email": "drahul.reddy.mec24@itbhu.ac.in"
  },
  {
    "id": 459,
    "name": "Aarav Tyagi",
    "username": "aara",
    "password": "aara9434",
    "email": "aarav.tyagi.cse25@itbhu.ac.in"
  },
  {
    "id": 460,
    "name": "Ramzeen Musadhik",
    "username": "ramz",
    "password": "ramz5633",
    "email": "ramzeen.musadhik.bme24@itbhu.ac.in"
  },
  {
    "id": 461,
    "name": "Sakshi",
    "username": "saks",
    "password": "saks2264",
    "email": "sakshi.student.che24@itbhu.ac.in"
  },
  {
    "id": 462,
    "name": "Arya Giri",
    "username": "arya",
    "password": "arya0112",
    "email": "arya.giri.bme24@itbhu.ac.in"
  },
  {
    "id": 463,
    "name": "ATHARVA PANDEY",
    "username": "atha",
    "password": "atha5130",
    "email": "atharva.pandey.che25@itbhu.ac.in"
  },
  {
    "id": 464,
    "name": "Sarthak",
    "username": "sart",
    "password": "sart7077",
    "email": "sarthak.student.cse24@itbhu.ac.in"
  },
  {
    "id": 465,
    "name": "Tarun Agrawal",
    "username": "taru",
    "password": "taru5918",
    "email": "tarun.agrawal.mat24@itbhu.ac.in"
  },
  {
    "id": 466,
    "name": "Aman Purwar",
    "username": "aman",
    "password": "aman6582",
    "email": "aman.purwar.mec25@itbhu.ac.in"
  },
  {
    "id": 467,
    "name": "BANDI SIDDU KUMAR REDDY",
    "username": "band",
    "password": "band8555",
    "email": "bandisiddu.kreddy.cse25@itbhu.ac.in"
  },
  {
    "id": 468,
    "name": "Anmol Agarwal",
    "username": "anmo",
    "password": "anmo5359",
    "email": "anmol.agarwal.cse24@itbhu.ac.in"
  },
  {
    "id": 469,
    "name": "ritisha vivek",
    "username": "riti",
    "password": "riti5130",
    "email": "ritisha.vivek.cer24@itbhu.ac.in"
  },
  {
    "id": 470,
    "name": "Bhavanasi Anjana Akhileswar",
    "username": "bhav",
    "password": "bhav3596",
    "email": "banjana.akhileswar.cse25@itbhu.ac.in"
  },
  {
    "id": 471,
    "name": "Nagmani jha",
    "username": "nagm",
    "password": "nagm7604",
    "email": "nagmani.jha.cd.civ23@itbhu.ac.in"
  }

]

// ─── MATH ─────────────────────────────────────────────────────────────────────
const r = Math.random
function poisson(k, mu) {
  if (mu <= 0) return k === 0 ? 1 : 0
  let lp = -mu + k * Math.log(mu)
  for (let i = 1; i <= k; i++) lp -= Math.log(i)
  return Math.exp(lp)
}
function wPick(items) {
  const total = items.reduce((s, x) => s + (x.w || x.weight || 0), 0)
  let rv = r() * total
  for (const item of items) { rv -= (item.w || item.weight || 0); if (rv <= 0) return item }
  return items[items.length - 1]
}
function vigOdds(p) { return p <= 0 ? 50 : Math.min(50, Math.max(1.01, (1 / p) * (1 - VIG))) }
function fmt(n) { return Number(n).toFixed(2) }

function calcWinProbs(sP, sA, lP, lA, rem) {
  let pW = 0, pD = 0, pL = 0
  const mP = lP * rem, mA = lA * rem
  for (let i = 0; i <= 10; i++) {
    const pi = poisson(i, mP)
    for (let j = 0; j <= 10; j++) {
      const prob = pi * poisson(j, mA)
      const fp = sP + i, fa = sA + j
      if (fp > fa) pW += prob
      else if (fp === fa) pD += prob
      else pL += prob
    }
  }
  return { pW, pD, pL }
}

function calcAllOdds(score, minute, lP, lA) {
  const rem = Math.max(0, 90 - minute)
  const { pW, pD, pL } = calcWinProbs(score.P, score.A, lP, lA, rem)
  const muR = (lP + lA) * rem
  const g = score.P + score.A

  let pOver
  if (g >= 3) pOver = 1
  else { const need = Math.floor(2.5 - g + 1); let pU = 0; for (let k = 0; k < need; k++) pU += poisson(k, muR); pOver = 1 - pU }

  const sp = score.P > 0, sa = score.A > 0
  let pBTTS
  if (sp && sa) pBTTS = 1
  else if (sp) pBTTS = 1 - Math.exp(-lA * rem)
  else if (sa) pBTTS = 1 - Math.exp(-lP * rem)
  else pBTTS = (1 - Math.exp(-lP * rem)) * (1 - Math.exp(-lA * rem))

  const tL = lP + lA
  const pAny = rem > 0 ? 1 - Math.exp(-tL * rem) : 0
  const pPN = rem > 0 && tL > 0 ? (lP / tL) * pAny : 0
  const pAN = rem > 0 && tL > 0 ? (lA / tL) * pAny : 0
  const pNone = rem > 0 ? Math.exp(-tL * rem) : 1
  const ahT = pW + pL
  const pPAH = ahT > 0 ? pW / ahT : 0.5
  const pAAH = ahT > 0 ? pL / ahT : 0.5

  return {
    match: { pW, pD, pL },
    ou: { pOver, pUnder: 1 - pOver },
    btts: { pY: pBTTS, pN: 1 - pBTTS },
    next: { pP: pPN, pA: pAN, pNone },
    ah: { pP: pPAH, pA: pAAH },
  }
}

// ─── ENGINE ───────────────────────────────────────────────────────────────────
function simulateMinute(lP, lA) {
  for (const side of ["P", "A"]) {
    if (r() < 0.008) return { type: "penalty", side }
    if (r() < 0.06) {
      const dr = r(), dt = dr < 0.35 ? "long" : dr < 0.75 ? "med" : "short"
      const dn = dt === "long" ? 30 + r() * 10 : dt === "med" ? 20 + r() * 10 : 10 + r() * 10
      const pr = r(), pos = pr < 0.33 ? "left" : pr < 0.66 ? "central" : "right"
      return { type: "freekick", side, dt, dn: Math.round(dn), pos }
    }
    if (r() < 0.05) return { type: "corner", side }
  }
  const evs = []
  for (const side of ["P", "A"]) {
    const lam = side === "P" ? lP : lA
    if (r() < 1 - Math.exp(-lam)) {
      const sc = wPick(TEAMS[side].goalScorers)
      evs.push({ type: "goal", side, scorer: sc.name })
    }
  }
  for (const side of ["P", "A"]) {
    if (r() < 0.001) evs.push({ type: "red", side, sy: false })
    if (r() < 0.008) { evs.push({ type: "yellow", side }); if (r() < 0.003) evs.push({ type: "red", side, sy: true }) }
  }
  return { type: "normal", evs }
}

function resolvePenalty(side) {
  const taker = wPick(TEAMS[side].penalty)
  const dirs = Object.keys(taker.dir)
  let dr = r(), dir = dirs[2]
  let cum = 0; for (const d of dirs) { cum += taker.dir[d]; if (r() < cum) { dir = d; break } }
  const gk = TEAMS[side === "P" ? "A" : "P"]
  const gkDive = gk.gkDive
  const gkDir = r() < gkDive.L ? "L" : r() < gkDive.L + gkDive.C ? "C" : "R"
  const pSave = gkDir === dir ? taker.sameP : taker.diffP
  if (r() < 0.04) return { outcome: "post", taker: taker.name }
  if (r() < pSave) return { outcome: "saved", taker: taker.name, keeperDir: gkDir }
  if (r() < 0.03) return { outcome: "miss", taker: taker.name }
  return { outcome: "goal", taker: taker.name }
}

function resolveFreekick(side, dt, pos) {
  const taker = wPick(TEAMS[side].freekick)
  const posMod = pos === "central" ? 1.0 : 0.6
  const distMod = dt === "short" ? 0.5 : dt === "med" ? 1.0 : 0.7
  const pDirect = taker.ba * posMod * distMod
  if (r() < 0.08) return { outcome: "post", taker: taker.name }
  if (r() < pDirect) {
    const conv = taker.conv[dt]
    if (r() < conv) return { outcome: "goal", taker: taker.name, scorer: taker.name }
    if (r() < 0.52) return { outcome: "saved", taker: taker.name }
    return { outcome: "offtarget", taker: taker.name }
  }
  const rv = r()
  if (rv < 0.12) return { outcome: "goal", taker: taker.name, scorer: "Header" }
  if (rv < 0.32) return { outcome: "saved", taker: taker.name }
  if (rv < 0.67) return { outcome: "offtarget", taker: taker.name }
  return { outcome: "blocked", taker: taker.name }
}

function resolveCorner(side) {
  const taker = wPick(TEAMS[side].corner)
  const bonus = taker.bonus || 1.0
  const rv = r()
  const pG = 0.11 * bonus
  if (rv < 0.03) return { outcome: "goal", scorer: "Direct!", taker: taker.name }
  if (rv < 0.03 + pG) return { outcome: "goal", scorer: "Header", taker: taker.name }
  if (rv < 0.03 + pG + 0.22) return { outcome: "saved", taker: taker.name }
  if (rv < 0.03 + pG + 0.52) return { outcome: "offtarget", taker: taker.name }
  return { outcome: "cleared", taker: taker.name }
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
let _nid = 0
function mkN(msg, type = "tick") { return { id: _nid++, msg, type } }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%}
body{background:#080d0a;color:#e8ffe8;font-family:'JetBrains Mono','Courier New',monospace}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:#0a0f0a}
::-webkit-scrollbar-thumb{background:#1e3a1e;border-radius:2px}
button{cursor:pointer;border:none;outline:none;font-family:inherit}
button:hover{filter:brightness(1.1)}
button:active{filter:brightness(0.9)}
@keyframes slideIn{from{transform:translateX(10px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes goalFlash{0%,100%{background:#0d2a0d}50%{background:#0d400d}}
@keyframes spIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
`

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState("login") // login | game | admin

  if (view === "admin") return <AdminView onBack={() => setView("login")} />
  if (!user) return <LoginView onLogin={(u) => { setUser(u); setView("game") }} onAdmin={() => setView("admin")} />
  return <GameView user={user} onLogout={() => { setUser(null); setView("login") }} />
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginView({ onLogin, onAdmin }) {
  const [uname, setUname] = useState("")
  const [pass, setPass]   = useState("")
  const [err, setErr]     = useState("")
  const [loading, setLoading] = useState(false)

  const submit = () => {
    setErr("")
    if (!uname.trim() || !pass.trim()) { setErr("Enter username and password."); return }
    if (uname.trim().toLowerCase() === "admin" && pass.trim() === ADMIN_PASSWORD) { onAdmin(); return }
    setLoading(true)
    setTimeout(() => {
      const u = USERS.find(x => x.username === uname.trim().toLowerCase() && x.password === pass.trim())
      setLoading(false)
      if (u) onLogin(u)
      else setErr("Invalid credentials.")
    }, 400)
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#080d0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚽</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: "#c8ff00" }}>
              BET<span style={{ color: "#fff" }}>FORGE</span>
            </div>
            <div style={{ fontSize: 11, color: "#2a4a2a", marginTop: 6, letterSpacing: 1 }}>QUANTX · FOOTBALL SIMULATION</div>
          </div>
          <div style={{ background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 6, padding: "32px 28px" }}>
            <div style={{ fontSize: 11, color: "#558855", fontWeight: 700, letterSpacing: 1.5, marginBottom: 24 }}>SIGN IN</div>
            {["USERNAME", "PASSWORD"].map((label, i) => (
              <div key={label} style={{ marginBottom: i === 0 ? 16 : 24 }}>
                <label style={{ fontSize: 10, color: "#3a5a3a", letterSpacing: 1, display: "block", marginBottom: 6 }}>{label}</label>
                <input
                  type={i === 1 ? "password" : "text"}
                  value={i === 0 ? uname : pass}
                  onChange={e => i === 0 ? setUname(e.target.value) : setPass(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder={i === 0 ? "e.g. sakt" : "e.g. sakt3220"}
                  style={{ width: "100%", background: "#0d200d", border: "1px solid #1a3a1a", borderRadius: 3, color: "#e8ffe8", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "#c8ff00"}
                  onBlur={e => e.target.style.borderColor = "#1a3a1a"}
                />
              </div>
            ))}
            {err && <div style={{ background: "#1a0808", border: "1px solid #ff444422", borderRadius: 3, padding: "8px 12px", fontSize: 11, color: "#ff8888", marginBottom: 16 }}>⚠️ {err}</div>}
            <button onClick={submit} disabled={loading} style={{ width: "100%", background: loading ? "#8aaa00" : "#c8ff00", color: "#080d0a", fontWeight: 700, fontSize: 13, padding: "11px 0", borderRadius: 3, letterSpacing: 1.5 }}>
              {loading ? "CHECKING..." : "▶ ENTER"}
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#2a4a2a", lineHeight: 1.8 }}>
            Username: first 4 letters of name &nbsp;|&nbsp; Password: username + last 4 digits of phone
          </div>
        </div>
      </div>
    </>
  )
}

// ─── GAME VIEW ────────────────────────────────────────────────────────────────
function GameView({ user, onLogout }) {
  const match = useMatch(user)
  const pnl = match.balance - INITIAL_BAL

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#080d0a" }}>
        {/* HEADER */}
        <header style={{ background: "linear-gradient(90deg,#0d1f0d,#0a150a,#0d1f0d)", borderBottom: "1px solid #1a3a1a", padding: "0 16px", flexShrink: 0 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: "#c8ff00" }}>BET<span style={{ color: "#fff" }}>FORGE</span></span>
              <StatusBadge status={match.gs.status} minute={match.gs.minute} />
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Stat label="PLAYER" value={user.name.split(" ")[0]} color="#fff" />
              <Stat label="BALANCE" value={`💰 ${match.balance.toLocaleString()}`} color="#c8ff00" />
              <Stat label="P&L" value={`${pnl >= 0 ? "+" : ""}${pnl}`} color={pnl > 0 ? "#4eff91" : pnl < 0 ? "#ff4e4e" : "#888"} />
              <button onClick={onLogout} style={{ background: "none", color: "#2a4a2a", fontSize: 10, border: "1px solid #1a3a1a", padding: "4px 8px", borderRadius: 2, letterSpacing: 1 }}>EXIT</button>
            </div>
          </div>
        </header>

        {/* SCOREBOARD */}
        <Scoreboard gs={match.gs} odds={match.odds} onStart={match.startMatch} />

        {/* THREE-COL BODY */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "240px 1fr 240px", minHeight: 0 }}>
          {/* LEFT */}
          <aside style={{ borderRight: "1px solid #1a3a1a", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <PH>LIVE FEED</PH>
            <NotifFeed notifs={match.notifs} />
          </aside>

          {/* CENTER */}
          <main style={{ overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 0 }}>
            {match.gs.status === "prematch" ? (
              <PreMatchBanner />
            ) : (
              <Markets gs={match.gs} odds={match.odds} onSelect={(m, sel, od) => match.setBetSlip({ m, sel, od })} />
            )}
            {match.betSlip && (
              <BetSlip
                slip={match.betSlip}
                stake={match.stake} setStake={match.setStake}
                onPlace={match.placeBet}
                onClose={() => match.setBetSlip(null)}
              />
            )}
          </main>

          {/* RIGHT */}
          <aside style={{ borderLeft: "1px solid #1a3a1a", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <PH>MY BETS</PH>
            <BetList bets={match.bets} />
            {match.gs.status === "finished" && <FinalResult gs={match.gs} balance={match.balance} bets={match.bets} onReset={match.resetMatch} user={user} />}
          </aside>
        </div>
      </div>

      {/* SET PIECE OVERLAY */}
      {match.gs.setpiece && (
        <SetPieceOverlay
          sp={match.gs.setpiece}
          spTimer={match.spTimer}
          stake={match.stake} setStake={match.setStake}
          onBet={match.placeBet}
        />
      )}
    </>
  )
}

// ─── MATCH HOOK ───────────────────────────────────────────────────────────────
function useMatch(user) {
  const lP0 = (TEAMS.P.strength * TEAMS.P.homeAdv) / 90
  const lA0 = (TEAMS.A.strength * TEAMS.A.homeAdv) / 90

  

  const [gs, setGs]       = useState(makeGS)
  const [bets, setBets]   = useState([])
  const [balance, setBal] = useState(INITIAL_BAL)
  const [notifs, setNotifs] = useState([mkN("🏟️ Welcome! Portugal vs Argentina. Press KICK OFF to begin.", "system")])
  const [odds, setOdds]   = useState(null)
  const [betSlip, setBetSlip] = useState(null)
  const [stake, setStake] = useState("100")
  const [spTimer, setSpTimer] = useState(0)

  const gsRef   = useRef(gs);   gsRef.current   = gs
  const betsRef = useRef(bets); betsRef.current = bets
  const balRef  = useRef(balance); balRef.current = balance
  const timerRef = useRef(null)

  const push = useCallback((msg, type = "tick") => {
    setNotifs(prev => [mkN(msg, type), ...prev].slice(0, 80))
  }, [])

  const recalc = useCallback((state) => {
    setOdds(calcAllOdds(state.score, state.minute, state.lP, state.lA))
  }, [])

  const settleBets = useCallback((finalScore, events) => {
    let totalWin = 0
    setBets(prev => prev.map(b => {
      if (b.status !== "active") return b
      let won = false
      if (b.market === "match") {
        const res = finalScore.P > finalScore.A ? "por" : finalScore.P < finalScore.A ? "arg" : "draw"
        won = b.sel === res
      } else if (b.market === "ou") {
        won = b.sel === "over" ? (finalScore.P + finalScore.A) > 2.5 : (finalScore.P + finalScore.A) <= 2.5
      } else if (b.market === "btts") {
        const both = finalScore.P > 0 && finalScore.A > 0
        won = b.sel === "yes" ? both : !both
      } else if (b.market === "ah") {
        const res = finalScore.P > finalScore.A ? "por" : "arg"
        won = b.sel === res
      }
      if (won) { totalWin += b.stake * b.odds; setBal(prev => prev + b.stake * b.odds) }
      return { ...b, status: won ? "won" : "lost" }
    }))
    // save score to shared leaderboard storage
    setTimeout(() => {
      try {
        window.storage?.set(`lb_${user.id}`, JSON.stringify({
          name: user.name, id: user.id,
          balance: balRef.current,
          bets: betsRef.current.length,
          ts: Date.now(),
        }), true)
      } catch (_) {}
    }, 1000)
  }, [user])

  const processSetpiece = useCallback((sp) => {
    const { side } = sp
    let newScore = { ...gsRef.current.score }
    let goalEvent = null

    if (sp.type === "penalty") {
      const res = resolvePenalty(side)
      const oppGK = TEAMS[side === "P" ? "A" : "P"].gk
      if (res.outcome === "goal") {
        newScore[side]++
        goalEvent = { type: "goal", side, scorer: res.taker, penalty: true }
        push(`⚽ PENALTY GOAL! ${res.taker} converts! ${TEAMS.P.name} ${newScore.P}–${newScore.A}`, "goal")
      } else if (res.outcome === "saved") push(`🧤 SAVED! ${oppGK} stops the penalty!`, "save")
      else if (res.outcome === "post") push(`🔔 POST! Penalty rattles the woodwork!`, "post")
      else push(`❌ MISS! Penalty blazed over the bar!`, "miss")
      setBets(prev => prev.map(b => {
        if (b.market !== "sp_pen" || b.status !== "active") return b
        const won = b.sel === res.outcome || (b.sel === "miss" && (res.outcome === "miss" || res.outcome === "post"))
        if (won) setBal(prev => prev + b.stake * b.odds)
        return { ...b, status: won ? "won" : "lost" }
      }))
    } else if (sp.type === "freekick") {
      const res = resolveFreekick(side, sp.dt, sp.pos)
      const scored = res.outcome === "goal"
      if (scored) {
        newScore[side]++
        goalEvent = { type: "goal", side, scorer: res.scorer || res.taker }
        push(`⚽ FREE KICK GOAL! ${res.taker} curls it in! ${newScore.P}–${newScore.A}`, "goal")
      } else if (res.outcome === "saved") push(`🧤 Free kick saved!`, "save")
      else if (res.outcome === "post") push(`🔔 Free kick hits the post!`, "post")
      else push(`❌ Free kick ${res.outcome}.`, "miss")
      setBets(prev => prev.map(b => {
        if (b.market !== "sp_fk" || b.status !== "active") return b
        const won = (b.sel === "goal" && scored) || (b.sel === res.outcome && !scored)
        if (won) setBal(prev => prev + b.stake * b.odds)
        return { ...b, status: won ? "won" : "lost" }
      }))
    } else if (sp.type === "corner") {
      const res = resolveCorner(side)
      const scored = res.outcome === "goal"
      if (scored) {
        newScore[side]++
        goalEvent = { type: "goal", side, scorer: res.scorer, corner: true }
        push(`⚽ CORNER GOAL! ${res.taker} delivers — ${res.scorer}! ${newScore.P}–${newScore.A}`, "goal")
      } else push(`🛡️ Corner ${res.outcome} — no goal.`, "tick")
      setBets(prev => prev.map(b => {
        if (b.market !== "sp_cor" || b.status !== "active") return b
        const won = (b.sel === "goal" && scored) || (b.sel === res.outcome && !scored)
        if (won) setBal(prev => prev + b.stake * b.odds)
        return { ...b, status: won ? "won" : "lost" }
      }))
    }
    return { newScore, newEvent: goalEvent }
  }, [push])

  const advanceMinute = useCallback(() => {
    setGs(prev => {
      if (prev.status === "finished" || prev.status === "halftime" || prev.setpiece) return prev
      const min = prev.minute + 1
      const endFirst  = 45 + (prev.stoppage?.first  || 0)
      const endSecond = 90 + (prev.stoppage?.second || 0)

      if (prev.phase === "first" && min > endFirst) {
        const s2 = Math.min(5, Math.max(1, Math.round(3 + 0.5 * (prev.redCards.P + prev.redCards.A))))
        push(`🔔 HALF TIME — ${TEAMS.P.name} ${prev.score.P}–${prev.score.A} ${TEAMS.A.name}`, "system")
        return { ...prev, minute: min, status: "halftime", phase: "second", stoppage: { ...prev.stoppage, second: s2 } }
      }
      if (prev.phase === "second" && min > endSecond) {
        const w = prev.score.P > prev.score.A ? TEAMS.P.name : prev.score.P < prev.score.A ? TEAMS.A.name : "Draw"
        push(`⏱️ FULL TIME — ${TEAMS.P.name} ${prev.score.P}–${prev.score.A} ${TEAMS.A.name}! Result: ${w}`, "system")
        settleBets(prev.score, prev.events)
        return { ...prev, minute: min, status: "finished" }
      }

      const sim = simulateMinute(prev.lP, prev.lA)
      let { score: ns, lP: nlP, lA: nlA, events: ne, redCards: nRC } = { ...prev, score: { ...prev.score }, events: [...prev.events], redCards: { ...prev.redCards } }

      if (sim.type === "penalty" || sim.type === "freekick" || sim.type === "corner") {
        const { side } = sim
        const titles = { penalty: `🚨 PENALTY — ${TEAMS[side].name.toUpperCase()}!`, freekick: `🎯 FREE KICK — ${TEAMS[side].name.toUpperCase()}`, corner: `🚩 CORNER — ${TEAMS[side].name.toUpperCase()}` }
        const markets = { penalty: "sp_pen", freekick: "sp_fk", corner: "sp_cor" }
        const timers = { penalty: 20, freekick: 30, corner: 25 }
        const msgs = {
          penalty: `🚨 PENALTY! ${TEAMS[side].name} — 20s to bet!`,
          freekick: `🎯 FREE KICK! ${TEAMS[side].name} — ${sim.dn || ""}yds ${sim.pos || ""} — 30s!`,
          corner: `🚩 CORNER! ${TEAMS[side].name} — 25s to bet!`,
        }
        push(msgs[sim.type], sim.type === "penalty" ? "penalty" : sim.type === "freekick" ? "freekick" : "corner")
        const spOdds = sim.type === "penalty"
          ? [{ sel: "goal", label: "Goal scored", p: 0.76 }, { sel: "saved", label: "Saved", p: 0.18 }, { sel: "miss", label: "Miss/Post", p: 0.06 }]
          : sim.type === "freekick"
          ? [{ sel: "goal", label: "Goal", p: 0.12 }, { sel: "saved", label: "Saved", p: 0.35 }, { sel: "offtarget", label: "Off target", p: 0.35 }, { sel: "blocked", label: "Blocked", p: 0.18 }]
          : [{ sel: "goal", label: "Goal", p: 0.14 }, { sel: "saved", label: "Saved", p: 0.22 }, { sel: "offtarget", label: "Off target", p: 0.30 }, { sel: "cleared", label: "Cleared", p: 0.34 }]
        return { ...prev, minute: min, setpiece: { ...sim, spTitle: titles[sim.type], market: markets[sim.type], timerSec: timers[sim.type], spOdds } }
      }

      for (const ev of (sim.evs || [])) {
        if (ev.type === "goal") {
          ns[ev.side]++
          ne.push(ev)
          if (ns.P === ns.A && ns.P + ns.A > 0) push(`🔥 EQUALIZER! ${ev.scorer} levels it — ${ns.P}–${ns.A}!`, "goal")
          else if (min > 90) push(`🚨 STOPPAGE GOAL! ${ev.scorer} for ${TEAMS[ev.side].name}! ${ns.P}–${ns.A}`, "goal")
          else push(`⚽ GOAL! ${ev.scorer} (${TEAMS[ev.side].short}) ${ns.P}–${ns.A} ${min}'`, "goal")
        } else if (ev.type === "red") {
          nRC[ev.side]++
          if (ev.side === "P") nlP *= 0.65; else nlA *= 0.65
          push(`🔴 ${ev.sy ? "SECOND YELLOW" : "RED CARD"}! ${TEAMS[ev.side].name} down to 10 men!`, "card")
        } else if (ev.type === "yellow") {
          push(`🟨 Yellow card — ${TEAMS[ev.side].name}`, "card")
        }
      }

      if (min === 45 + (prev.stoppage?.first || 0)) push(`⏱️ ${prev.stoppage?.first || 0} min stoppage time in first half`, "system")
      if (min === 90) push(`⏱️ ${prev.stoppage?.second || 0} min stoppage time in second half`, "system")
      if (min % 5 === 0 && !(sim.evs || []).length) push(`${min}' — Match continues.`, "tick")

      const newState = { ...prev, minute: min, score: ns, lP: nlP, lA: nlA, events: ne, redCards: nRC }
      recalc(newState)
      return newState
    })
  }, [push, settleBets, recalc])

  useEffect(() => {
    if (gs.status !== "live" || gs.setpiece) return
    timerRef.current = setTimeout(advanceMinute, TICK_SPEED)
    return () => clearTimeout(timerRef.current)
  }, [gs.status, gs.minute, gs.setpiece, advanceMinute])

  useEffect(() => {
    if (gs.status !== "halftime") return
    const t = setTimeout(() => {
      setGs(prev => ({ ...prev, status: "live", phase: "second", minute: 46 }))
      push("▶️ Second half underway!", "system")
    }, 5000)
    return () => clearTimeout(t)
  }, [gs.status, push])

  useEffect(() => {
    if (!gs.setpiece) return
    setSpTimer(gs.setpiece.timerSec)
    const iv = setInterval(() => {
      setSpTimer(prev => {
        if (prev <= 1) {
          clearInterval(iv)
          setGs(prevGs => {
            if (!prevGs.setpiece) return prevGs
            const { newScore, newEvent } = processSetpiece(prevGs.setpiece)
            const next = { ...prevGs, score: newScore, events: [...prevGs.events, ...(newEvent ? [newEvent] : [])], setpiece: null }
            recalc(next)
            return next
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [gs.setpiece, processSetpiece, recalc])

  const placeBet = useCallback((market, sel, od, maxOverride) => {
    const s = parseInt(stake) || 0
    const mx = maxOverride || MAX_BET
    if (s < MIN_BET) { push(`⚠️ Min bet is ${MIN_BET} coins.`, "warn"); return false }
    if (s > mx) { push(`⚠️ Max bet is ${mx} coins.`, "warn"); return false }
    const active = betsRef.current.filter(b => b.status === "active").length
    if (active >= MAX_ACTIVE) { push("⚠️ Max 4 active bets.", "warn"); return false }
    if (balRef.current < s) { push("⚠️ Insufficient balance.", "warn"); return false }
    setBal(prev => prev - s)
    const label = `${market.toUpperCase()} — ${sel}`
    setBets(prev => [...prev, { id: _nid++, market, sel, stake: s, odds: od, status: "active", label }])
    setBetSlip(null)
    push(`✅ Bet: ${s} coins @ ${fmt(od)} on ${sel}`, "system")
    return true
  }, [stake, push])

  const startMatch = useCallback(() => {
    const s1 = Math.min(5, Math.max(1, Math.round(2 + r() * 2)))
    const initial = { ...makeGS(), status: "live", minute: 0, stoppage: { first: s1, second: 0 } }
    setGs(initial); recalc(initial)
    push("⚽ KICK OFF! Portugal vs Argentina is underway!", "system")
    push(`⏱️ ${s1} min stoppage time planned for first half`, "system")
  }, [recalc, push])

  function makeGS() {
    return { minute: 0, score: { P: 0, A: 0 }, lP: lP0, lA: lA0, status: "prematch", events: [], redCards: { P: 0, A: 0 }, phase: "first", stoppage: { first: 0, second: 0 }, setpiece: null }
  }

  const resetMatch = useCallback(() => {
    setGs(makeGS()); setBets([]); setBal(INITIAL_BAL); setOdds(null); setBetSlip(null); setStake("100")
    setNotifs([mkN("🏟️ New match! Portugal vs Argentina. Press KICK OFF to begin.", "system")])
  }, [])

  return { gs, bets, balance, notifs, odds, betSlip, setBetSlip, stake, setStake, spTimer, placeBet, startMatch, resetMatch }
}

// ─── SCOREBOARD ───────────────────────────────────────────────────────────────
function Scoreboard({ gs, odds, onStart }) {
  const pW = odds?.match?.pW || 0
  const pD = odds?.match?.pD || 0
  const statusLabel = { prematch: "PRE-MATCH", live: `${gs.minute}'`, halftime: "HALF TIME", finished: "FULL TIME" }[gs.status]

  return (
    <div style={{ background: "linear-gradient(180deg,#0d200d,#081408)", borderBottom: "1px solid #1a3a1a", padding: "14px 20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center" }}>
        <TeamInfo side="P" align="left" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <ScoreNum n={gs.score.P} />
            <span style={{ fontSize: 22, color: "#2a4a2a" }}>–</span>
            <ScoreNum n={gs.score.A} />
          </div>
          <div style={{ fontSize: gs.status === "live" ? 13 : 10, color: gs.status === "live" ? "#4eff91" : "#558855", letterSpacing: 1, fontWeight: gs.status === "live" ? 700 : 400 }}>
            {statusLabel}
          </div>
          {gs.status === "prematch" && (
            <button onClick={onStart} style={{ marginTop: 4, background: "#c8ff00", color: "#080d0a", fontWeight: 700, fontSize: 12, padding: "7px 24px", borderRadius: 2, letterSpacing: 1 }}>▶ KICK OFF</button>
          )}
          {gs.status === "live" && odds && (
            <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
              {[["POR", pW], ["DRAW", pD], ["ARG", 1 - pW - pD]].map(([label, p]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 1 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "#c8ff00", fontWeight: 700 }}>{fmt(vigOdds(p))}</div>
                </div>
              ))}
            </div>
          )}
          {gs.redCards && (gs.redCards.P > 0 || gs.redCards.A > 0) && (
            <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#ff6666" }}>
              {gs.redCards.P > 0 && <span>🔴×{gs.redCards.P} POR</span>}
              {gs.redCards.A > 0 && <span>ARG 🔴×{gs.redCards.A}</span>}
            </div>
          )}
        </div>
        <TeamInfo side="A" align="right" />
      </div>
    </div>
  )
}

function TeamInfo({ side, align }) {
  const t = TEAMS[side]
  return (
    <div style={{ width: 140, textAlign: align }}>
      <div style={{ fontSize: 20 }}>{t.flag}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e8ffe8", letterSpacing: 1 }}>{t.name}</div>
      <div style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 1 }}>{t.short}</div>
    </div>
  )
}

function ScoreNum({ n }) {
  return <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", minWidth: 52, textAlign: "center", lineHeight: 1 }}>{n}</div>
}

// ─── MARKETS ──────────────────────────────────────────────────────────────────
function Markets({ gs, odds, onSelect }) {
  if (!odds) return null
  const min = gs.minute
  const { match, ou, btts, next, ah } = odds

  const closed = (m) => {
    if (gs.status === "finished") return true
    const c = { match: 85, ou: 70, btts: 75, ah: 80, next: 88 }
    return min >= (c[m] || 90)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* M1: Match Result */}
      <MCard title="MATCH RESULT (1X2)" sub={`Closes min 85`} closed={closed("match")}>
        <BO label={`🟢 ${TEAMS.P.name} Win`} odds={vigOdds(match.pW)} onSel={() => onSelect("match", "por", vigOdds(match.pW))} />
        <BO label="Draw" odds={vigOdds(match.pD)} onSel={() => onSelect("match", "draw", vigOdds(match.pD))} />
        <BO label={`🔵 ${TEAMS.A.name} Win`} odds={vigOdds(match.pL)} onSel={() => onSelect("match", "arg", vigOdds(match.pL))} />
        <ProbBar vals={[match.pW, match.pD, match.pL]} colors={["#4eff91", "#888", "#4499ff"]} />
      </MCard>

      {/* M2: O/U 2.5 */}
      <MCard title="OVER / UNDER 2.5 GOALS" sub={`Closes min 70`} closed={closed("ou")}>
        <BO label={`Over 2.5  (${gs.score.P + gs.score.A} scored)`} odds={vigOdds(ou.pOver)} onSel={() => onSelect("ou", "over", vigOdds(ou.pOver))} />
        <BO label="Under 2.5" odds={vigOdds(ou.pUnder)} onSel={() => onSelect("ou", "under", vigOdds(ou.pUnder))} />
        <ProbBar vals={[ou.pOver, ou.pUnder]} colors={["#c8ff00", "#2a4a2a"]} />
      </MCard>

      {/* M3: BTTS */}
      <MCard title="BOTH TEAMS TO SCORE" sub={`Closes min 75`} closed={closed("btts")}>
        <BO label={`Yes — POR ${gs.score.P > 0 ? "✓" : "○"} ARG ${gs.score.A > 0 ? "✓" : "○"}`} odds={vigOdds(btts.pY)} onSel={() => onSelect("btts", "yes", vigOdds(btts.pY))} />
        <BO label="No" odds={vigOdds(btts.pN)} onSel={() => onSelect("btts", "no", vigOdds(btts.pN))} />
        <ProbBar vals={[btts.pY, btts.pN]} colors={["#4eff91", "#ff4e4e"]} />
      </MCard>

      {/* M4: Asian Handicap */}
      <MCard title="ASIAN HANDICAP (-0.5)" sub={`Closes min 80 · Must win outright`} closed={closed("ah")}>
        <BO label={`🟢 ${TEAMS.P.name} -0.5`} odds={vigOdds(ah.pP)} onSel={() => onSelect("ah", "por", vigOdds(ah.pP))} />
        <BO label={`🔵 ${TEAMS.A.name} -0.5`} odds={vigOdds(ah.pA)} onSel={() => onSelect("ah", "arg", vigOdds(ah.pA))} />
        <ProbBar vals={[ah.pP, ah.pA]} colors={["#1a7a1a", "#1a3a7a"]} />
      </MCard>

      {/* M5: Next Goal */}
      <MCard title="NEXT GOAL SCORER (TEAM)" sub={`Closes min 88 · Resets after each goal`} closed={closed("next")}>
        <BO label={`🟢 ${TEAMS.P.name} scores next`} odds={vigOdds(next.pP)} onSel={() => onSelect("next", "por", vigOdds(next.pP))} />
        <BO label={`🔵 ${TEAMS.A.name} scores next`} odds={vigOdds(next.pA)} onSel={() => onSelect("next", "arg", vigOdds(next.pA))} />
        <BO label="No more goals" odds={vigOdds(next.pNone)} onSel={() => onSelect("next", "none", vigOdds(next.pNone))} />
        <ProbBar vals={[next.pP, next.pA, next.pNone]} colors={["#1a7a1a", "#1a3a7a", "#333"]} />
      </MCard>
    </div>
  )
}

function MCard({ title, sub, closed, children }) {
  return (
    <div style={{ background: "#0a150a", border: `1px solid ${closed ? "#1a2a1a" : "#1e3e1e"}`, borderRadius: 4, overflow: "hidden", opacity: closed ? 0.5 : 1, marginBottom: 6 }}>
      <div style={{ padding: "7px 12px", borderBottom: "1px solid #1a3a1a", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1f0d" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#c8ff00", letterSpacing: 1.5 }}>{title}</span>
        <span style={{ fontSize: 9, color: closed ? "#ff5555" : "#558855" }}>{closed ? "🔒 CLOSED" : sub}</span>
      </div>
      <div style={{ padding: "7px 10px", display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>
    </div>
  )
}

function BO({ label, odds, onSel }) {
  return (
    <button onClick={onSel} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: 2, padding: "6px 10px", fontFamily: "inherit" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8ff00"; e.currentTarget.style.background = "#112211" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a3a1a"; e.currentTarget.style.background = "#0d1f0d" }}>
      <span style={{ fontSize: 10, color: "#8aaa8a" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#c8ff00" }}>{fmt(odds)}</span>
    </button>
  )
}

function ProbBar({ vals, colors }) {
  const total = vals.reduce((s, v) => s + v, 0)
  return (
    <div style={{ display: "flex", height: 3, borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
      {vals.map((v, i) => <div key={i} style={{ flex: total > 0 ? v / total : 1 / vals.length, background: colors[i] }} />)}
    </div>
  )
}

// ─── BET SLIP ─────────────────────────────────────────────────────────────────
function BetSlip({ slip, stake, setStake, onPlace, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: 320, background: "#0d200d", border: "1px solid #c8ff00", borderRadius: 6, padding: 16, zIndex: 100, boxShadow: "0 4px 20px #000a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1 }}>BET SLIP</div>
        <button onClick={onClose} style={{ background: "none", color: "#558855", fontSize: 16 }}>✕</button>
      </div>
      <div style={{ fontSize: 11, color: "#8aaa8a", marginBottom: 4 }}>{slip.m.toUpperCase()} — {slip.sel}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#c8ff00", marginBottom: 12 }}>@ {fmt(slip.od)}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="number" value={stake} onChange={e => setStake(e.target.value)}
          placeholder="Stake" min={MIN_BET} max={MAX_BET}
          style={{ flex: 1, background: "#0a150a", border: "1px solid #1a3a1a", borderRadius: 2, color: "#e8ffe8", fontFamily: "inherit", fontSize: 14, padding: "8px 10px", outline: "none" }}
          onFocus={e => e.target.style.borderColor = "#c8ff00"} onBlur={e => e.target.style.borderColor = "#1a3a1a"}
        />
        <button onClick={() => setStake(String(MAX_BET))} style={{ background: "#1a3a1a", color: "#558855", fontSize: 10, padding: "0 10px", borderRadius: 2 }}>MAX</button>
      </div>
      <div style={{ fontSize: 10, color: "#558855", marginBottom: 12 }}>Potential return: <span style={{ color: "#c8ff00", fontWeight: 700 }}>{fmt((parseInt(stake) || 0) * slip.od)}</span> coins</div>
      <button onClick={() => onPlace(slip.m, slip.sel, slip.od)} style={{ width: "100%", background: "#c8ff00", color: "#080d0a", fontWeight: 700, fontSize: 13, padding: "10px 0", borderRadius: 3, letterSpacing: 1 }}>PLACE BET</button>
    </div>
  )
}

// ─── NOTIFICATION FEED ────────────────────────────────────────────────────────
const NC = {
  goal: { bg: "#0d2a0d", border: "#4eff91", text: "#a0ffb0" },
  save: { bg: "#0a1a2a", border: "#44aaff", text: "#88bbff" },
  post: { bg: "#1a1a0a", border: "#ffdd44", text: "#ffee88" },
  miss: { bg: "#1a0a0a", border: "#ff5555", text: "#ff9999" },
  penalty: { bg: "#2a0d0d", border: "#ff4444", text: "#ffaaaa" },
  freekick: { bg: "#0d1a2a", border: "#4499ff", text: "#88bbff" },
  corner: { bg: "#1a0d2a", border: "#aa44ff", text: "#cc88ff" },
  card: { bg: "#1a1a0a", border: "#ffdd00", text: "#ffee66" },
  system: { bg: "#0d1a0d", border: "#448844", text: "#88bb88" },
  warn: { bg: "#2a1a0a", border: "#ff8800", text: "#ffbb44" },
  tick: { bg: "#0d150d", border: "#1a3a1a", text: "#5a7a5a" },
}

function NotifFeed({ notifs }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
      {notifs.map(n => {
        const c = NC[n.type] || NC.tick
        return (
          <div key={n.id} style={{ padding: "6px 10px", marginBottom: 4, borderRadius: 2, fontSize: 10, lineHeight: 1.5, background: c.bg, borderLeft: `2px solid ${c.border}`, color: c.text, animation: "slideIn 0.25s ease" }}>
            {n.msg}
          </div>
        )
      })}
    </div>
  )
}

// ─── BET LIST ────────────────────────────────────────────────────────────────
function BetList({ bets }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
      {bets.length === 0 && <div style={{ padding: 16, color: "#2a4a2a", fontSize: 10, textAlign: "center" }}>No bets yet.<br /><span style={{ color: "#1a3a1a" }}>Click any odds to bet.</span></div>}
      {[...bets].reverse().map(b => (
        <div key={b.id} style={{ padding: "7px 10px", marginBottom: 4, borderRadius: 2, fontSize: 10, background: b.status === "won" ? "#0d2a0d" : b.status === "lost" ? "#1a0a0a" : "#0d150d", borderLeft: `2px solid ${b.status === "won" ? "#4eff91" : b.status === "lost" ? "#ff4444" : "#c8ff00"}` }}>
          <div style={{ color: "#8aaa8a", marginBottom: 3 }}>{b.label}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#558855" }}>{b.stake} @ <span style={{ color: "#c8ff00" }}>{fmt(b.odds)}</span></span>
            <span style={{ color: b.status === "won" ? "#4eff91" : b.status === "lost" ? "#ff4444" : "#888", fontWeight: 700 }}>
              {b.status === "won" ? `+${fmt(b.stake * b.odds)}` : b.status === "lost" ? `-${b.stake}` : "● LIVE"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── FINAL RESULT ─────────────────────────────────────────────────────────────
function FinalResult({ gs, balance, bets, onReset, user }) {
  const pnl = balance - INITIAL_BAL
  const won = bets.filter(b => b.status === "won").length
  const lost = bets.filter(b => b.status === "lost").length

  return (
    <div style={{ padding: 12, borderTop: "1px solid #1a3a1a", background: "#0d200d" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1, marginBottom: 8 }}>⏱️ FULL TIME</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{gs.score.P} – {gs.score.A}</div>
      <div style={{ fontSize: 10, color: pnl >= 0 ? "#4eff91" : "#ff4e4e", marginBottom: 8 }}>{pnl >= 0 ? "+" : ""}{pnl} coins ({won}W / {lost}L)</div>
      <button onClick={onReset} style={{ width: "100%", background: "#1a3a1a", color: "#c8ff00", fontWeight: 700, fontSize: 11, padding: "8px 0", borderRadius: 2, letterSpacing: 1 }}>↺ NEW MATCH</button>
    </div>
  )
}

// ─── SET PIECE OVERLAY ────────────────────────────────────────────────────────
function SetPieceOverlay({ sp, spTimer, stake, setStake, onBet }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#0a1f0a", border: "2px solid #c8ff00", borderRadius: 8, padding: "24px 28px", maxWidth: 360, width: "90%", animation: "spIn 0.3s ease" }}>
        <div style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#c8ff00", letterSpacing: 1, marginBottom: 6 }}>{sp.spTitle}</div>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: spTimer <= 5 ? "#ff4444" : "#fff", animation: spTimer <= 5 ? "pulse 0.5s infinite" : "none" }}>{spTimer}s</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <input
            type="number" value={stake} onChange={e => setStake(e.target.value)}
            placeholder="Stake" min={MIN_BET} max={MAX_BET}
            style={{ flex: 1, background: "#0d200d", border: "1px solid #1a3a1a", borderRadius: 2, color: "#e8ffe8", fontFamily: "inherit", fontSize: 13, padding: "8px 10px", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sp.spOdds.map(opt => (
            <button key={opt.sel} onClick={() => onBet(sp.market, opt.sel, vigOdds(opt.p))}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: 2, padding: "8px 12px", fontFamily: "inherit", color: "#e8ffe8" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8ff00"; e.currentTarget.style.background = "#112211" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a3a1a"; e.currentTarget.style.background = "#0d1f0d" }}>
              <span style={{ fontSize: 11, color: "#8aaa8a" }}>{opt.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#c8ff00" }}>{fmt(vigOdds(opt.p))}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 9, color: "#3a5a3a", textAlign: "center" }}>Bet auto-resolves when timer hits 0</div>
      </div>
    </div>
  )
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({ onBack }) {
  const [pw, setPw]     = useState("")
  const [auth, setAuth] = useState(false)
  const [err, setErr]   = useState("")
  const [lb, setLb]     = useState([])
  const [loading, setLoading] = useState(false)
  const [matchConfig, setMatchConfig] = useState({ teamAStr: 1.4, teamBStr: 1.6, homeAdv: 1.2, tickSpeed: 4000 })

  const login = () => {
    if (pw === ADMIN_PASSWORD) setAuth(true)
    else setErr("Wrong password.")
  }

  const loadLB = async () => {
    setLoading(true)
    try {
      const keys = await window.storage?.list("lb_", true)
      const entries = []
      for (const key of (keys?.keys || [])) {
        try {
          const res = await window.storage.get(key, true)
          if (res?.value) entries.push(JSON.parse(res.value))
        } catch (_) {}
      }
      entries.sort((a, b) => b.balance - a.balance)
      setLb(entries)
    } catch (_) {}
    setLoading(false)
  }

  const clearLB = async () => {
    if (!confirm("Clear all leaderboard data?")) return
    try {
      const keys = await window.storage?.list("lb_", true)
      for (const key of (keys?.keys || [])) await window.storage.delete(key, true)
      setLb([])
    } catch (_) {}
  }

  const exportCSV = () => {
    const rows = [["Rank", "Name", "Balance", "P&L", "Bets"]]
    lb.forEach((e, i) => rows.push([i + 1, e.name, e.balance.toFixed(0), (e.balance - INITIAL_BAL).toFixed(0), e.bets || 0]))
    const csv = rows.map(r => r.join(",")).join("\n")
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = "betforge_leaderboard.csv"; a.click()
  }

  if (!auth) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#080d0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 320, padding: 24, background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 6 }}>
          <div style={{ marginBottom: 16, color: "#c8ff00", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>🔐 ADMIN LOGIN</div>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()}
            placeholder="Admin password" style={{ width: "100%", background: "#0d200d", border: "1px solid #1a3a1a", borderRadius: 2, color: "#e8ffe8", fontFamily: "inherit", fontSize: 13, padding: "9px 10px", outline: "none", marginBottom: 12 }} />
          {err && <div style={{ color: "#ff8888", fontSize: 11, marginBottom: 10 }}>⚠️ {err}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={login} style={{ flex: 1, background: "#c8ff00", color: "#080d0a", fontWeight: 700, fontSize: 12, padding: "9px 0", borderRadius: 2 }}>ENTER</button>
            <button onClick={onBack} style={{ background: "#1a3a1a", color: "#558855", fontSize: 12, padding: "9px 14px", borderRadius: 2 }}>BACK</button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#080d0a", padding: 24 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #1a3a1a" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#c8ff00", letterSpacing: 2 }}>BETFORGE ADMIN</div>
              <div style={{ fontSize: 10, color: "#3a5a3a", marginTop: 2 }}>Competition Control Panel</div>
            </div>
            <button onClick={onBack} style={{ background: "#1a3a1a", color: "#558855", fontSize: 11, padding: "8px 16px", borderRadius: 2, letterSpacing: 1 }}>← BACK</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Match Config */}
            <div style={{ background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1.5, marginBottom: 14 }}>MATCH CONFIGURATION</div>
              {[
                { label: "Portugal Strength (0.5–2.0)", key: "teamAStr", step: 0.1 },
                { label: "Argentina Strength (0.5–2.0)", key: "teamBStr", step: 0.1 },
                { label: "Home Advantage (1.0–1.3)", key: "homeAdv", step: 0.05 },
                { label: "Tick Speed ms (2000–10000)", key: "tickSpeed", step: 500 },
              ].map(({ label, key, step }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 9, color: "#3a5a3a", letterSpacing: 1, display: "block", marginBottom: 4 }}>{label}</label>
                  <input type="number" step={step} value={matchConfig[key]}
                    onChange={e => setMatchConfig(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                    style={{ width: "100%", background: "#0d200d", border: "1px solid #1a3a1a", borderRadius: 2, color: "#e8ffe8", fontFamily: "inherit", fontSize: 13, padding: "7px 10px", outline: "none" }} />
                </div>
              ))}
              <div style={{ marginTop: 8, padding: "10px 12px", background: "#0d2a0d", borderRadius: 2, fontSize: 9, color: "#4eff91", lineHeight: 1.8 }}>
                λ_POR = {((matchConfig.teamAStr * matchConfig.homeAdv) / 90).toFixed(4)} goals/min<br />
                λ_ARG = {(matchConfig.teamBStr / 90).toFixed(4)} goals/min<br />
                Expected: POR {(matchConfig.teamAStr * matchConfig.homeAdv).toFixed(2)} — ARG {matchConfig.teamBStr.toFixed(2)} goals
              </div>
            </div>

            {/* Leaderboard Controls */}
            <div style={{ background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 4, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1.5, marginBottom: 14 }}>LEADERBOARD CONTROLS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <button onClick={loadLB} style={{ background: "#1a3a1a", color: "#4eff91", fontFamily: "inherit", fontWeight: 700, fontSize: 11, padding: "10px 0", borderRadius: 2, letterSpacing: 1 }}>
                  {loading ? "LOADING..." : "↻ REFRESH LEADERBOARD"}
                </button>
                <button onClick={exportCSV} disabled={lb.length === 0} style={{ background: "#1a2a1a", color: "#c8ff00", fontFamily: "inherit", fontWeight: 700, fontSize: 11, padding: "10px 0", borderRadius: 2, letterSpacing: 1, opacity: lb.length === 0 ? 0.5 : 1 }}>
                  ↓ EXPORT CSV
                </button>
                <button onClick={clearLB} style={{ background: "#2a0d0d", color: "#ff8888", fontFamily: "inherit", fontWeight: 700, fontSize: 11, padding: "10px 0", borderRadius: 2, letterSpacing: 1 }}>
                  🗑️ CLEAR ALL DATA
                </button>
              </div>
              <div style={{ fontSize: 9, color: "#3a5a3a", lineHeight: 1.8 }}>
                Leaderboard updates when players complete a match.<br />
                Data persists across sessions via shared storage.
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          {lb.length > 0 && (
            <div style={{ marginTop: 16, background: "#0a150a", border: "1px solid #1e3e1e", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a3a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#c8ff00", letterSpacing: 1.5 }}>LIVE LEADERBOARD — {lb.length} PLAYERS</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "#0d200d" }}>
                      {["RANK", "NAME", "BALANCE", "P&L", "BETS"].map(h => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "#3a5a3a", fontWeight: 700, fontSize: 9, letterSpacing: 1, borderBottom: "1px solid #1a3a1a" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lb.map((e, i) => {
                      const pnl = e.balance - INITIAL_BAL
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`
                      return (
                        <tr key={e.id} style={{ background: i % 2 === 0 ? "#0a150a" : "#0d1a0d", borderBottom: "1px solid #1a2a1a" }}>
                          <td style={{ padding: "8px 14px", color: i < 3 ? "#c8ff00" : "#558855", fontWeight: 700 }}>{medal}</td>
                          <td style={{ padding: "8px 14px", color: "#e8ffe8" }}>{e.name}</td>
                          <td style={{ padding: "8px 14px", color: "#c8ff00", fontWeight: 700 }}>{Math.round(e.balance).toLocaleString()}</td>
                          <td style={{ padding: "8px 14px", color: pnl >= 0 ? "#4eff91" : "#ff4e4e", fontWeight: 700 }}>{pnl >= 0 ? "+" : ""}{Math.round(pnl)}</td>
                          <td style={{ padding: "8px 14px", color: "#558855" }}>{e.bets || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info */}
          <div style={{ marginTop: 16, padding: 14, background: "#0a150a", border: "1px solid #1a2a1a", borderRadius: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#558855", letterSpacing: 1, marginBottom: 8 }}>GAME RULES QUICK REFERENCE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 9, color: "#3a5a3a", lineHeight: 1.8 }}>
              <div>Starting balance: {INITIAL_BAL} coins<br />Min bet: {MIN_BET} | Max: {MAX_BET}<br />Max active bets: {MAX_ACTIVE}<br />Vig (house edge): {VIG * 100}%</div>
              <div>Match: 90 + stoppage time<br />Set pieces: penalties, freekicks, corners<br />Red card: λ reduced 35%<br />Odds locked at placement</div>
              <div>M1 closes: 85' | M2: 70'<br />M3 closes: 75' | M4: 80'<br />M5 closes: 88' (resets on goal)<br />Tiebreak: fewer bets wins</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function StatusBadge({ status, minute }) {
  const map = { prematch: { label: "PRE", bg: "#222", color: "#558855" }, live: { label: `● ${minute}'`, bg: "#c8ff00", color: "#080d0a" }, halftime: { label: "HT", bg: "#555", color: "#fff" }, finished: { label: "FT", bg: "#333", color: "#888" } }
  const s = map[status] || map.prematch
  return <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 2, letterSpacing: 1 }}>{s.label}</span>
}

function Stat({ label, value, color }) {
  return <div style={{ textAlign: "right" }}><div style={{ fontSize: 8, color: "#3a5a3a", letterSpacing: 1 }}>{label}</div><div style={{ fontSize: 12, fontWeight: 700, color }}>{value}</div></div>
}

function PH({ children }) {
  return <div style={{ padding: "8px 14px", borderBottom: "1px solid #1a3a1a", fontSize: 9, color: "#3a5a3a", fontWeight: 700, letterSpacing: 1.5, flexShrink: 0 }}>{children}</div>
}

function PreMatchBanner() {
  return (
    <div style={{ textAlign: "center", padding: "50px 20px", color: "#558855" }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>⚽</div>
      <div style={{ fontSize: 16, color: "#c8ff00", marginBottom: 8, fontWeight: 700, letterSpacing: 2 }}>PORTUGAL vs ARGENTINA</div>
      <div style={{ fontSize: 10, color: "#3a5a3a", lineHeight: 2 }}>
        5 live markets · Poisson engine · Set piece overlays<br />
        Proper 90 min + stoppage · Real-time odds
      </div>
    </div>
  )
}
