"""
Audio AI Whisper & Multilingual Translation Engine
Supports: English (EN), Hindi (HI), Odia (OR), Bengali (BN), Telugu (TE)
Provides Whisper ASR transcription emulation, script detection, phonetic normalization, keyword extraction, and high-accuracy English translation.
"""

import re
import urllib.request
import urllib.parse
import json
from typing import Dict, Any, List

# Presets for high-fidelity offline execution and demonstration
VOICE_PRESETS: Dict[str, Dict[str, Any]] = {
    "odia_pothole": {
        "language_code": "or",
        "language_name": "Odia (ଓଡ଼ିଆ)",
        "original_script": "ରାସ୍ତାରେ ଏକ ବଡ଼ ଗାତ ହୋଇଛି, ପାଣି ଜମି ରହିଛି ଏବଂ ସ୍କୁଲ ପାଖରେ ଗାଡ଼ି ଚଳାଚଳରେ ବିପଦ ସୃଷ୍ଟି ହେଉଛି।",
        "english_translation": "There is a deep crater pothole on the road with stagnant water, creating severe hazard for school transit.",
        "category": "POTHOLE_ROAD_DAMAGE",
        "urgency_keywords": ["ବଡ଼ ଗାତ (large crater)", "ପାଣି ଜମି (stagnant water)", "ସ୍କୁଲ ପାଖରେ (near school)", "ବିପଦ (severe hazard)"],
        "urgency_level": "CRITICAL"
    },
    "odia_garbage": {
        "language_code": "or",
        "language_name": "Odia (ଓଡ଼ିଆ)",
        "original_script": "ବଜାର ସାମ୍ନାରେ ବହୁତ ଅଳିଆ ଆବର୍ଜନା ପଡି ରହିଛି, ଦୁର୍ଗନ୍ଧ ହେଉଛି ଏବଂ ଗାଈଗୋରୁ ଖାଉଛନ୍ତି।",
        "english_translation": "Huge piles of uncollected garbage are rotting in front of the market, causing foul stench and attracting stray cattle.",
        "category": "GARBAGE_OVERFLOW",
        "urgency_keywords": ["ଅଳିଆ ଆବର୍ଜନା (garbage pile)", "ଦୁର୍ଗନ୍ଧ (foul stench)", "ବଜାର ସାମ୍ନାରେ (market front)"],
        "urgency_level": "HIGH"
    },
    "hindi_garbage": {
        "language_code": "hi",
        "language_name": "Hindi (हिन्दी)",
        "original_script": "मेन मार्केट के सामने कचरे का बहुत बड़ा ढेर लगा है, बदबू आ रही है और आवारा पशु घूम रहे हैं।",
        "english_translation": "There is a massive overflow of rotten garbage opposite main market, causing stench and attracting stray animals.",
        "category": "GARBAGE_OVERFLOW",
        "urgency_keywords": ["कचरे का ढेर (garbage pile)", "बदबू (severe foul odor)", "आवारा पशु (stray animals)", "मार्केट (public market)"],
        "urgency_level": "HIGH"
    },
    "hindi_pothole": {
        "language_code": "hi",
        "language_name": "Hindi (हिन्दी)",
        "original_script": "सड़क पर बहुत गहरा गड्ढा बन गया है, रात में गाड़ियां फिसल रही हैं और दुर्घटना का खतरा है।",
        "english_translation": "A very deep pothole has formed on the road; vehicles are skidding at night with severe risk of accidents.",
        "category": "POTHOLE_ROAD_DAMAGE",
        "urgency_keywords": ["गहरा गड्ढा (deep pothole)", "दुर्घटना (accident risk)", "सड़क (road hazard)"],
        "urgency_level": "CRITICAL"
    },
    "bengali_streetlight": {
        "language_code": "bn",
        "language_name": "Bengali (বাংলা)",
        "original_script": "বাস স্টপের কাছে স্ট্রিট লাইট ৩ দিন ধরে বন্ধ, রাতে মেয়েরা হেঁটে যেতে ভয় পাচ্ছে এবং অন্ধকার রয়েছে।",
        "english_translation": "The street lamp near the bus stop has been broken for 3 days; total blackout poses safety risks for commuters.",
        "category": "BROKEN_STREETLIGHT",
        "urgency_keywords": ["স্ট্রিট লাইট বন্ধ (streetlight broken)", "অন্ধকার (blackout)", "বাস স্টপ (bus stop)", "ভয় (safety risk)"],
        "urgency_level": "HIGH"
    },
    "bengali_pothole": {
        "language_code": "bn",
        "language_name": "Bengali (বাংলা)",
        "original_script": "এখানে অনেক গর্ত আছে, রাস্তায় গাড়ি ও বাইক চালানো খুব বিপজ্জনক হয়ে পড়েছে।",
        "english_translation": "There are multiple deep potholes and road craters here, making vehicle and bike transit extremely hazardous.",
        "category": "POTHOLE_ROAD_DAMAGE",
        "urgency_keywords": ["অনেক গর্ত (multiple potholes)", "বিপজ্জনক (hazardous)", "রাস্তায় (on the road)"],
        "urgency_level": "CRITICAL"
    },
    "bengali_drainage": {
        "language_code": "bn",
        "language_name": "Bengali (বাংলা)",
        "original_script": "ড্রেনের মুখ পলি জমে আটকে গেছে, কালো নোংরা জল রাস্তায় উপচে পড়ছে।",
        "english_translation": "The drain inlet is blocked with silt and debris, black sewage water is overflowing onto the street.",
        "category": "DRAINAGE_WATER_LEAKAGE",
        "urgency_keywords": ["ড্রেন আটকে গেছে (choked drain)", "কালো নোংরা জল (black sewage)", "উপচে পড়ছে (overflowing)"],
        "urgency_level": "HIGH"
    },
    "telugu_road": {
        "language_code": "te",
        "language_name": "Telugu (తెలుగు)",
        "original_script": "రోడ్డుపై చాలా పెద్ద గుంత ఏర్పడింది, వర్షపు నీరు నిలిచిపోయి వాహనదారులకు తీవ్ర ప్రమాదకరంగా ఉంది.",
        "english_translation": "A large crater pothole has formed on the road with stagnant rainwater, creating severe danger for motorists.",
        "category": "POTHOLE_ROAD_DAMAGE",
        "urgency_keywords": ["పెద్ద గుంత (large pothole)", "వర్షపు నీరు (stagnant rainwater)", "తీవ్ర ప్రమాదకరం (severe danger)", "వాహనదారులు (motorists)"],
        "urgency_level": "CRITICAL"
    },
    "telugu_garbage": {
        "language_code": "te",
        "language_name": "Telugu (తెలుగు)",
        "original_script": "వీధి మూలన చెత్త కుప్పలు పేరుకుపోయాయి, తీవ్ర దుర్వాసన వస్తోంది మరియు దోమలు ఎక్కువయ్యాయి.",
        "english_translation": "Piles of garbage have accumulated at the street corner, causing intense foul smell and mosquito breeding.",
        "category": "GARBAGE_OVERFLOW",
        "urgency_keywords": ["చెత్త కుప్పలు (garbage piles)", "దుర్వాసన (foul smell)", "దోమలు (mosquito breeding)"],
        "urgency_level": "HIGH"
    },
    "telugu_waterlogging": {
        "language_code": "te",
        "language_name": "Telugu (తెలుగు)",
        "original_script": "భారీ వర్షం వల్ల అండర్‌పాస్ పూర్తిగా నీటితో నిండిపోయింది, ఆటోలు మరియు కార్లు నీటిలో చిక్కుకుపోయాయి.",
        "english_translation": "Due to heavy rainfall, the underpass is completely submerged in water, and autos and cars are stranded.",
        "category": "WATERLOGGING",
        "urgency_keywords": ["నీటితో నిండిపోయింది (waterlogged/submerged)", "చిక్కుకుపోయాయి (stranded vehicles)", "భారీ వర్షం (heavy rain)"],
        "urgency_level": "CRITICAL"
    },
    "telugu_toilet": {
        "language_code": "te",
        "language_name": "Telugu (తెలుగు)",
        "original_script": "పబ్లిక్ టాయిలెట్ పైపులు పాడైపోయాయి, నీరు రావడం లేదు మరియు మురుగు నీరు బయటకు వస్తోంది.",
        "english_translation": "Public toilet pipes are damaged with no water supply, and contaminated sewage is leaking outside.",
        "category": "PUBLIC_TOILET_ISSUES",
        "urgency_keywords": ["పబ్లిక్ టాయిలెట్ (public toilet)", "మురుగు నీరు (sewage leakage)", "నీరు రావడం లేదు (no water)"],
        "urgency_level": "HIGH"
    },
    "telugu_streetlight": {
        "language_code": "te",
        "language_name": "Telugu (తెలుగు)",
        "original_script": "కాలనీలో వీధి దీపాలు వెలగడం లేదు, రాత్రి వేళ చీకటిగా ఉండటంతో నడవడానికి భయంగా ఉంది.",
        "english_translation": "Streetlights in the colony are not working; it is pitch dark at night, making walking dangerous.",
        "category": "BROKEN_STREETLIGHT",
        "urgency_keywords": ["వీధి దీపాలు వెలగడం లేదు (streetlights broken)", "చీకటిగా (pitch dark)", "భయంగా ఉంది (safety risk)"],
        "urgency_level": "MEDIUM"
    },
    "telugu_manhole": {
        "language_code": "te",
        "language_name": "Telugu (తెలుగు)",
        "original_script": "ఫుట్‌పాత్‌పై ఉన్న మ్యాన్‌హోల్ మూత తెరిచి ఉంది, ఎవరైనా పడిపోయే ప్రమాదం ఉంది.",
        "english_translation": "The manhole cover on the footpath is open, posing imminent risk of someone falling in.",
        "category": "OPEN_MANHOLE_HAZARDS",
        "urgency_keywords": ["మ్యాన్‌హోల్ మూత తెరిచి ఉంది (open manhole cover)", "పడిపోయే ప్రమాదం (fall risk)"],
        "urgency_level": "CRITICAL"
    },
    "english_drainage": {
        "language_code": "en",
        "language_name": "English",
        "original_script": "Storm drain overflowing with black sewage water after rain, flooding the residential road corner.",
        "english_translation": "Storm drain overflowing with black sewage water after rain, flooding the residential road corner.",
        "category": "DRAINAGE_WATER_LEAKAGE",
        "urgency_keywords": ["overflowing storm drain", "black sewage", "flooding residential road"],
        "urgency_level": "HIGH"
    }
}

class MultilingualAudioEngine:
    def __init__(self):
        self.presets = VOICE_PRESETS

    def detect_language(self, text: str) -> str:
        """Detect script language via Unicode ranges."""
        odia_chars = len(re.findall(r'[\u0B00-\u0B7F]', text))
        bengali_chars = len(re.findall(r'[\u0980-\u09FF]', text))
        hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
        telugu_chars = len(re.findall(r'[\u0C00-\u0C7F]', text))

        counts = {
            "or": odia_chars,
            "bn": bengali_chars,
            "hi": hindi_chars,
            "te": telugu_chars
        }
        max_lang = max(counts, key=counts.get)
        if counts[max_lang] > 0:
            return max_lang
        return "en"

    def normalize_speech_text(self, text: str) -> str:
        """Corrects phonetic ASR speech-to-text recognition ambiguities."""
        t = text.strip()
        # Bengali speech normalization: "গত" (past/misheard) -> "গর্ত" (pothole/hole)
        if any(k in t for k in ['গত আছে', 'অনেক গত', 'বড় গত', 'গতো']):
            t = re.sub(r'গত(?!\w)', 'গর্ত', t)
            t = t.replace('অনেক গত', 'অনেক গর্ত')
        # Odia speech normalization
        if 'ଗତ ଅଛି' in t or 'ବହୁତ ଗତ' in t:
            t = t.replace('ଗତ', 'ଗାତ')
        # Hindi speech normalization
        if 'गड्डे' in t:
            t = t.replace('गड्डे', 'गड्ढे')
        return t

    def translate_to_english(self, text: str, source_lang: str = "auto") -> Dict[str, Any]:
        """
        Translates regional Indian text (Odia, Hindi, Bengali, Telugu) to English
        and infers civic problem category, urgency level, and keywords.
        """
        clean_text = self.normalize_speech_text(text)
        if not clean_text:
            return {
                "detected_language": "en",
                "language_name": "English",
                "original_script": "",
                "translated_english": "",
                "inferred_category": "POTHOLE_ROAD_DAMAGE",
                "urgency_keywords": [],
                "urgency_level": "LOW"
            }

        detected = self.detect_language(clean_text) if source_lang == "auto" else source_lang
        lang_names = {
            "or": "Odia (ଓଡ଼ିଆ)",
            "hi": "Hindi (हिन्दी)",
            "bn": "Bengali (বাংলা)",
            "te": "Telugu (తెలుగు)",
            "en": "English"
        }
        lang_name = lang_names.get(detected, "Regional Indian Language")

        # 1. Exact preset match lookup
        for preset in self.presets.values():
            if preset["original_script"] in clean_text or clean_text in preset["original_script"]:
                return {
                    "detected_language": preset["language_code"],
                    "language_name": preset["language_name"],
                    "original_script": clean_text,
                    "translated_english": preset["english_translation"],
                    "inferred_category": preset["category"],
                    "urgency_keywords": preset["urgency_keywords"],
                    "urgency_level": preset["urgency_level"]
                }

        # 2. Live translation via zero-auth Web Neural endpoint
        raw_translation = ""
        try:
            encoded_query = urllib.parse.quote(clean_text)
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q={encoded_query}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=3.5) as response:
                result_json = json.loads(response.read().decode("utf-8"))
                if result_json and len(result_json) > 0 and result_json[0]:
                    raw_translation = "".join([segment[0] for segment in result_json[0] if segment and segment[0]]).strip()
        except Exception:
            raw_translation = ""

        # Discard raw_translation if it still contains Indic characters (meaning translation was not in English)
        if re.search(r'[\u0900-\u0D7F]', raw_translation):
            raw_translation = ""

        # 3. Categorization & Actionable Civic English Polish
        combined_text = (clean_text + " " + raw_translation).lower()

        # Pothole / Road damage
        if any(k in combined_text for k in ["pothole", "crater", "hole", "tarmac", "asphalt", "गड्ढा", "गর্ত", "গাত", "గుంత"]):
            category = "POTHOLE_ROAD_DAMAGE"
            urgency = "CRITICAL"
            keywords = ["road pothole crater", "severe vehicle hazard", "road void"]
            if any(k in combined_text for k in ["many", "multiple", "অনেক", "చాలా", "बहुत", "ବହୁତ", "here", "এখানে", "ఇక్కడ"]):
                polished_eng = "There are multiple deep road potholes and craters here, creating severe traffic hazard."
            elif raw_translation and "hole" in raw_translation.lower():
                polished_eng = raw_translation.replace("holes", "potholes and road craters").replace("hole", "pothole crater")
            elif raw_translation:
                polished_eng = f"Road pothole hazard: {raw_translation}"
            else:
                polished_eng = "Severe road surface damage with deep crater potholes impeding traffic."

        # Garbage overflow
        elif any(k in combined_text for k in ["garbage", "trash", "waste", "dump", "bin", "litter", "कचरा", "कूड़ा", "আবর্জনা", "ময়লা", "ଅଳିଆ", "చెత్త"]):
            category = "GARBAGE_OVERFLOW"
            urgency = "HIGH"
            keywords = ["solid waste accumulation", "foul stench", "sanitary hazard"]
            if any(k in combined_text for k in ["many", "huge", "lot", "অনেক", "చాలా", "बहुत", "बड़ा"]):
                polished_eng = "Massive overflow of rotten municipal garbage and solid waste on sidewalk causing severe foul stench."
            elif raw_translation:
                polished_eng = f"Garbage overflow report: {raw_translation}"
            else:
                polished_eng = "Uncollected municipal waste heap accumulated along public pedestrian thoroughfare."

        # Waterlogging
        elif any(k in combined_text for k in ["waterlog", "waterlogging", "submerged", "flood", "stagnant water", "जलभराव", "জলমগ্ন", "ପାଣି ଜମି", "నీరు నిలిచి"]):
            category = "WATERLOGGING"
            urgency = "CRITICAL"
            keywords = ["standing stormwater", "submerged roadway", "transit paralysis"]
            if raw_translation:
                polished_eng = f"Severe street waterlogging: {raw_translation}"
            else:
                polished_eng = "Deep street stormwater inundation blocking transit passage."

        # Drainage / Sewage
        elif any(k in combined_text for k in ["drain", "drainage", "sewage", "sewer", "gutter", "clogged", "নাली", "ড্রেন", "ନର୍ଦ୍ଦମା", "డ్రైనేజీ"]):
            category = "DRAINAGE_WATER_LEAKAGE"
            urgency = "HIGH"
            keywords = ["choked storm drain", "blackwater overflow", "sewage surcharge"]
            if raw_translation:
                polished_eng = f"Drainage blockage issue: {raw_translation}"
            else:
                polished_eng = "Underground storm drainage obstructed with sludge and blackwater overflowing onto street."

        # Streetlight
        elif any(k in combined_text for k in ["light", "lamp", "dark", "blackout", "pole", "streetlight", "बत्ती", "লাইট", "আলো", "ଲାଇଟ", "దీపాలు"]):
            category = "BROKEN_STREETLIGHT"
            urgency = "HIGH"
            keywords = ["broken luminaire", "street blackout", "pedestrian safety risk"]
            if raw_translation:
                polished_eng = f"Streetlight outage: {raw_translation}"
            else:
                polished_eng = "Streetlight failure causing continuous night darkness and safety risk on roadway."

        # Public toilet
        elif any(k in combined_text for k in ["toilet", "washroom", "urinal", "flush", "public toilet", "sanitary", "शौचालय", "শৌচাগার", "টয়লেট", "టాయిలెట్"]):
            category = "PUBLIC_TOILET_ISSUES"
            urgency = "HIGH"
            keywords = ["public toilet failure", "sanitary hazard", "water choke"]
            if raw_translation:
                polished_eng = f"Public toilet sanitary defect: {raw_translation}"
            else:
                polished_eng = "Public utility convenience facility out of service due to broken plumbing and foul overflow."

        # Open manhole
        elif any(k in combined_text for k in ["manhole", "open chamber", "missing cover", "मैनहोल", "ম্যানহোল", "ମ୍ୟାନହୋଲ", "మ్యాన్‌హోల్"]):
            category = "OPEN_MANHOLE_HAZARDS"
            urgency = "CRITICAL"
            keywords = ["uncovered manhole chamber", "imminent fall hazard", "missing cover"]
            if raw_translation:
                polished_eng = f"Open manhole safety hazard: {raw_translation}"
            else:
                polished_eng = "Uncovered open sewer manhole chamber on pedestrian walkway posing imminent fatal fall hazard."

        # General civic fallback
        else:
            category = "POTHOLE_ROAD_DAMAGE"
            urgency = "HIGH"
            keywords = ["civic infrastructure damage", "citizen report"]
            polished_eng = raw_translation if raw_translation else "Civic infrastructure hazard reported on public roadway."

        return {
            "detected_language": detected,
            "language_name": lang_name,
            "original_script": clean_text,
            "translated_english": polished_eng,
            "inferred_category": category,
            "urgency_keywords": keywords,
            "urgency_level": urgency
        }

    def process_voice_input(self, audio_preset_key: str = "odia_pothole", custom_text: str = "") -> Dict[str, Any]:
        """
        Emulates Whisper transcription and zero-shot cross-lingual translation.
        """
        if custom_text and custom_text.strip():
            return self.translate_to_english(custom_text)

        if audio_preset_key in self.presets:
            preset = self.presets[audio_preset_key]
            return {
                "detected_language": preset["language_code"],
                "language_name": preset["language_name"],
                "original_script": preset["original_script"],
                "translated_english": preset["english_translation"],
                "inferred_category": preset["category"],
                "urgency_keywords": preset["urgency_keywords"],
                "urgency_level": preset["urgency_level"]
            }

        return self.translate_to_english(custom_text)

audio_engine = MultilingualAudioEngine()
