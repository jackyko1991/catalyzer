from itertools import product

PAIR = {"A": "T", "T": "A", "G": "C", "C": "G"}

# The standard genetic code: the 64 codons in TCAG order, and the amino acid each one names (* = stop).
_BASES = "TCAG"
_AMINO = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG"
CODON_TABLE = {"".join(c): aa for c, aa in zip(product(_BASES, repeat=3), _AMINO)}


def reverse_complement(dna: str) -> str:
    """The partner strand, read in its own 5'→3' direction.

    reverse_complement("ATGC") == "GCAT"
    """
    raise NotImplementedError


def translate(dna: str) -> str:
    """Translate from the first base, three bases per amino acid, up to (not including) the first stop codon.

    translate("ATGGCCTAA") == "MA"
    Raise ValueError if the string has letters other than A, C, G, T.
    """
    raise NotImplementedError
