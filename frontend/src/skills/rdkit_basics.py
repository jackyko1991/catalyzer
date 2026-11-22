from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, rdFingerprintGenerator

# 1. Read a molecule from SMILES (None means the string was not valid)
aspirin = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")
print(aspirin.GetNumAtoms(), "heavy atoms")

# 2. Atoms and bonds are a graph you can walk
for atom in list(aspirin.GetAtoms())[:3]:
    print(atom.GetIdx(), atom.GetSymbol(), "hydrogens:", atom.GetTotalNumHs(), "aromatic:", atom.GetIsAromatic())

# 3. One molecule, one canonical SMILES: the same string however it was written
print(Chem.MolToSmiles(Chem.MolFromSmiles("OC(=O)c1ccccc1OC(C)=O")))

# 4. Descriptors: numbers computed from the structure
print(round(Descriptors.MolWt(aspirin), 2), "g/mol")

# 5. Substructure search with SMARTS: does it contain a carboxylic acid?
acid = Chem.MolFromSmarts("C(=O)[OX2H1]")
print("carboxylic acid:", aspirin.HasSubstructMatch(acid))

# 6. Fingerprint and similarity
gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
salicylic = Chem.MolFromSmiles("OC(=O)c1ccccc1O")
a, b = set(gen.GetFingerprint(aspirin).GetOnBits()), set(gen.GetFingerprint(salicylic).GetOnBits())
print("Tanimoto:", round(len(a & b) / len(a | b), 3))

# 7. 3D coordinates: add hydrogens, embed, relax (the viewer's molecules are made this way)
mol3d = Chem.AddHs(aspirin)
params = AllChem.ETKDGv3()
params.randomSeed = 42
AllChem.EmbedMolecule(mol3d, params)
AllChem.MMFFOptimizeMolecule(mol3d)
print(mol3d.GetNumAtoms(), "atoms with 3D positions")
