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
    'dicts_config/default_dicts_config.json',
    'dicts_config/custom_dicts_config.json'
)

# Create a set of unique language codes, their full names, and text directions
language_map = {}
for lang_code, value in config.items():
    # Use the dictionary key as the language code
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

# Format the final content
formatted_content = ts_content.format(
    ',\n'.join(language_options),
    ',\n'.join(code_map),
    ',\n'.join(direction_map)
)

# Write to the language.ts file
output_path = Path('hunspell_live_frontend/src/constants/language.ts')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(formatted_content)

print(f"Updated {output_path} with {len(language_map)} languages") 