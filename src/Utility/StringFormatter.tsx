class StringFormatter {
	public static capitalizeFirstLetter = (str: string): string => {
		if (!str) return str; // Handle empty or undefined strings
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	};
}

export default StringFormatter;
