type Theme = {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        textPrimary: string;
        textDark: string;
        textInput: string;
        shadowColor: string;
        firstMatter: string;
        secondMatter: string;
        thirdMatter: string;
        fourthMatter: string;
        fifthMatter: string;
        borderFirstMatter: string;
        borderSecondMatter: string;
        borderThirdMatter: string;
        borderFourthMatter: string;
        borderFifthMatter: string;
    };

    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xx: number;
    };

    fontSize: {
        small: number;
        medium: number;
        normal: number;
        large: number;
        title: number;
    };

    fonts: {
        light: string;
        bold: string;
    };

    radius: {
        sm: number;
        md: number;
        lg: number;
        full: number;
    };
};

export const theme: Theme = {
    colors: {
        primary: '#005A63',
        secondary: '#FFDDD2',
        background: '#FFFFFF',
        textPrimary: '#FFFFFF',
        textDark: '#333333',
        textInput: '#D8CDC9',
        shadowColor: '#000000',
        firstMatter: '#EDF6F9',
        secondMatter: '#D7E1FD',
        thirdMatter: '#FFDDD2',
        fourthMatter: '#DD8C6A',
        fifthMatter: '#C6FDDB',
        borderFirstMatter: '#006D77',
        borderSecondMatter: '#02136B',
        borderThirdMatter: '#71270F',
        borderFourthMatter: '#3B180B',
        borderFifthMatter: '#013816',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xx: 50,
    },

    fontSize: {
        small: 12,
        medium: 14,
        normal: 16,
        large: 20,
        title: 24,
    },

    fonts: {
        light: 'Inter_300Light',
        bold: 'Inter_700Bold',
    },

    radius: {
        sm: 4,
        md: 10,
        lg: 50,
        full: 9999,
    },
};