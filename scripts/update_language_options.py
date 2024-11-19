import json
from pathlib import Path

def load_and_merge_configs(default_path, custom_path=None):
    # Read the default config
    with open(default_path, 'r') as f:
        config = json.load(f)
    
    # If custom config exists, merge it with default
    if custom_path and Path(custom_path).exists():
        with open(custom_path, 'r') as f:
            custom_config = json.load(f)
            # Merge custom config into default, overwriting any duplicates
            config.update(custom_config)
    
    return config

# Read and merge the configs
config = load_and_merge_configs(
    'default_dicts_config.json',
    'custom_dicts_config.json'
)

# Create a set of unique language codes, their full names, and text directions
language_map = {}
for key, value in config.items():
    lang_code = value['language_code']
    language = value['language']
    text_direction = value['text_direction']
    language_map[lang_code] = {'name': language, 'direction': text_direction}

# Sort languages by their full name
sorted_languages = sorted(language_map.items(), key=lambda x: x[1]['name'])

# Create the TypeScript content
ts_content = """export const LANGUAGE_OPTIONS = [
{}
] as const;

export const LANGUAGE_CODE_MAP: Record<string, string> = {{
{}
}};

export const TEXT_DIRECTION_MAP: Record<string, 'ltr' | 'rtl'> = {{
{}
}};

export const SPECIAL_CHARACTERS: Record<string, string[]> = {{
{}
}};
"""

# Format the language options
language_options = []
for lang_code, info in sorted_languages:
    language_options.append(f'  {{ label: "{info["name"]}", value: "{lang_code}" }}')

# Format the language code map
code_map = []
for lang_code in language_map.keys():
    # Quote the key if it contains a hyphen
    key = f"'{lang_code}'" if '-' in lang_code else lang_code
    code_map.append(f"  {key}: '{lang_code}'")

# Format the text direction map
direction_map = []
for lang_code, info in language_map.items():
    # Quote the key if it contains a hyphen
    key = f"'{lang_code}'" if '-' in lang_code else lang_code
    direction_map.append(f"  {key}: '{info['direction']}'")

# Create special characters map with proper key formatting
special_chars = {
    'fr': ['à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ', 'À', 'Â', 'Ç', 'É', 'È', 'Ê', 'Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü', 'Ÿ'],
    'es': ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ', 'Ü', '¿', '¡'],
    'de': ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü', 'ẞ'],
    'it': ['à', 'è', 'é', 'ì', 'î', 'ò', 'ù', 'À', 'È', 'É', 'Ì', 'Î', 'Ò', 'Ù'],
    'pt': ['á', 'â', 'ã', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'Á', 'Â', 'Ã', 'Ç', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú'],
    'pl': ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż', 'Ą', 'Ć', 'Ę', 'Ł', 'Ń', 'Ó', 'Ś', 'Ź', 'Ż'],
    'nl': ['é', 'ë', 'ï', 'ó', 'ö', 'ü', 'É', 'Ë', 'Ï', 'Ó', 'Ö', 'Ü'],
    'sv': ['å', 'ä', 'ö', 'Å', 'Ä', 'Ö'],
    'da': ['æ', 'ø', 'å', 'Æ', 'Ø', 'Å'],
    'no': ['æ', 'ø', 'å', 'Æ', 'Ø', 'Å'],
    'fi': ['ä', 'ö', 'Ä', 'Ö'],
    'cs': ['á', 'č', 'ď', 'é', 'ě', 'í', 'ň', 'ó', 'ř', 'š', 'ť', 'ú', 'ů', 'ý', 'ž', 'Á', 'Č', 'Ď', 'É', 'Ě', 'Í', 'Ň', 'Ó', 'Ř', 'Š', 'Ť', 'Ú', 'Ů', 'Ý', 'Ž'],
    'hu': ['á', 'é', 'í', 'ó', 'ö', 'ő', 'ú', 'ü', 'ű', 'Á', 'É', 'Í', 'Ó', 'Ö', 'Ő', 'Ú', 'Ü', 'Ű'],
    'ro': ['ă', 'â', 'î', 'ș', 'ț', 'Ă', 'Â', 'Î', 'Ș', 'Ț']
}

special_chars_entries = []
for lang_code in language_map.keys():
    # Quote the key if it contains a hyphen
    key = f"'{lang_code}'" if '-' in lang_code else lang_code
    # Get base language code (before hyphen or underscore) for special chars
    base_lang = lang_code.split('-')[0].split('_')[0]
    chars = special_chars.get(base_lang, [])
    special_chars_entries.append(f"  {key}: {json.dumps(chars, ensure_ascii=False)}")

# Format the final content
formatted_content = ts_content.format(
    ',\n'.join(language_options),
    ',\n'.join(code_map),
    ',\n'.join(direction_map),
    ',\n'.join(special_chars_entries)
)

# Write to the language.ts file
output_path = Path('correction_tool_frontend/src/constants/language.ts')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(formatted_content)

print(f"Updated {output_path} with {len(language_map)} languages") 