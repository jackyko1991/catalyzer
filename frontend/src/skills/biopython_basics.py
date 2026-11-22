from io import StringIO

from Bio import Align, SeqIO
from Bio.Seq import Seq

# 1. A sequence object knows it is DNA: complement, translate
gene = Seq("ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCC")
print(gene.reverse_complement()[:12])
print(gene.translate())

# 2. Read FASTA, the plain-text format of sequence databases (here from a string; usually a file)
fasta = """>sp|P69905|HBA_HUMAN Hemoglobin subunit alpha
MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR
>sp|P01958|HBA_HORSE Hemoglobin subunit alpha
MVLSAADKTNVKAAWSKVGGHAGEYGAEALERMFLGFPTTKTYFPHFDLSHGSAQVKAHGKKVGDALTLAVGHLDDLPGALSNLSDLHAHKLRVDPVNFKLLSHCLLSTLAVHLPNDFTPAVHASLDKFLSSVSTVLTSKYR
"""
human, horse = SeqIO.parse(StringIO(fasta), "fasta")
print(human.id, len(human.seq), "residues")

# 3. Align two proteins with a substitution matrix (BLOSUM62) and gap penalties
aligner = Align.PairwiseAligner(mode="global", open_gap_score=-10, extend_gap_score=-0.5)
aligner.substitution_matrix = Align.substitution_matrices.load("BLOSUM62")
best = aligner.align(human.seq, horse.seq)[0]
print("score:", best.score)
identical = sum(a == b for a, b in zip(best[0], best[1]))
print(f"identity: {100 * identical / len(human.seq):.1f}%")
