import os

def search_files(directory):
    spelling_files = []

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith((".rst", ".rsti")):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if "spelling" in content:
                        spelling_files.append(file_path)

    return spelling_files

# Pfad zum aktuellen Verzeichnis
current_directory = os.path.dirname(os.path.abspath(__file__))

# Suche nach .rst- und .rsti-Dateien, die "spelling" enthalten
spelling_files = search_files(current_directory)

# Ausgabe der Liste der Dateien
if spelling_files:
    print("Dateien, die 'spelling' enthalten:")
    for file in spelling_files:
        print(file)
else:
    print("Keine Dateien mit 'spelling' gefunden.")