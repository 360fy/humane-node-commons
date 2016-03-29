import _ from 'lodash';

class Language {
    constructor(code, name, unicode, startChar, endChar) {
        this.code = code;
        this.name = name;
        this.unicode = unicode;
        this.startChar = startChar || 0;
        this.endChar = endChar || 0;
    }
}

const Languages = [

    //new Language('en', 'english', 'English', 0x000, 0x0FF),
    new Language('hi', 'hindi', 'हिंदी', 0x900, 0x97F),
    new Language('mr', 'marathi', 'मराठी', 0x900, 0x97F),
    new Language('gu', 'gujarati', 'ગુજરાતી', 0xA80, 0xAFF),
    new Language('pa', 'punjabi', 'ਪੰਜਾਬੀ', 0xA00, 0xA7F),
    new Language('bn', 'bangla', 'বাংলা', 0x980, 0x9FF),
    new Language('kn', 'kannada', 'ಕನ್ನಡ', 0xC80, 0xCFF),
    new Language('ta', 'tamil', 'தமிழ்', 0xB80, 0xBFF),
    new Language('te', 'telugu', 'తెలుగు', 0xC00, 0xC7F),
    new Language('ml', 'malayalam', 'മലയാളം', 0xD00, 0xD7F),
    new Language('or', 'oriya', 'ଓଡିଆ', 0xB00, 0xB7F),
    new Language('ne', 'Nepali', 'नेपाली', 0x900, 0x97F),
    new Language('ar', 'Arabic', 'العربية', 0x600, 0x6FF),
    new Language('bh', 'Bhojpuri', 'भोजपुरी', 0x900, 0x97F)

];

const LanguageMap = (function () {
    const map = {};

    _.forEach(Languages, lang => {
        map[lang.code] = {code: lang.code, name: lang.name, unicode: lang.unicode};
        return true;
    });

    return map;
}());

export default class LanguageDetector {
    detect(_value) {
        const value = _.trim(_value);

        if (!value || _.isEmpty(value)) {
            return null;
        }

        const detectedLanguageMap = {};

        for (let i = 0; i < value.length; i++) {
            const charCode = value.charCodeAt(i);

            for (let j = 0; j < _.size(Languages); j++) {
                const lang = Languages[j];
                if (charCode >= lang.startChar && charCode <= lang.endChar) {
                    detectedLanguageMap[lang.code] = (detectedLanguageMap[lang.code] || 0) + 1;
                }
            }
        }

        if (_.size(detectedLanguageMap) !== 1 && detectedLanguageMap.en) {
            delete detectedLanguageMap.en;
        }

        // convert languages into array and sort descending by count
        // map them to Language object
        return _(detectedLanguageMap)
          .keys()
          .map(code => ({code, count: detectedLanguageMap[code]}))
          .sortBy(lang => 1.0 / lang.count)
          .map(lang => LanguageMap[lang.code])
          .value();
    }
}