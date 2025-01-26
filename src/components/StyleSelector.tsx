import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

export interface StyleOptions {
  mood: string;
  speed: string;
  experimental: string;
}

interface StyleSelectorProps {
  value: StyleOptions;
  onChange: (newValue: StyleOptions) => void;
}

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const handleChange = (event: SelectChangeEvent, type: keyof StyleOptions) => {
    onChange({
      ...value,
      [type]: event.target.value
    });
  };

  const moodOptions = [
    { value: 'dark', label: 'Dark (Industrial Techno)' },
    { value: 'very_dark', label: 'Very Dark (Dark Ambient Techno)' },
    { value: 'disturbing', label: 'Disturbing (Horror Techno)' }
  ];

  const speedOptions = [
    { value: 'vibing', label: 'Vibing (120-128 BPM)' },
    { value: 'cool', label: 'Cool (128-135 BPM)' },
    { value: 'speed', label: 'Speed (135-145 BPM)' }
  ];

  const experimentalOptions = [
    { value: 'glitch', label: 'Glitch (Distorted & Broken)' },
    { value: 'acid', label: 'Acid (303 Squelches)' },
    { value: 'drone', label: 'Drone (Hypnotic Layers)' },
    { value: 'noise', label: 'Noise (Industrial Elements)' },
    { value: 'abstract', label: 'Abstract (Experimental Sounds)' }
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      flexDirection: { xs: 'column', sm: 'row' },
      width: '100%',
      '& .MuiFormControl-root': {
        flex: 1,
        minWidth: { xs: '100%', sm: '200px' }
      }
    }}>
      <FormControl>
        <InputLabel sx={{ color: 'white' }}>Mood</InputLabel>
        <Select
          value={value.mood}
          label="Mood"
          onChange={(e) => handleChange(e, 'mood')}
          sx={{
            color: 'white',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '.MuiSvgIcon-root': {
              color: 'white',
            }
          }}
        >
          {moodOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel sx={{ color: 'white' }}>Speed</InputLabel>
        <Select
          value={value.speed}
          label="Speed"
          onChange={(e) => handleChange(e, 'speed')}
          sx={{
            color: 'white',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '.MuiSvgIcon-root': {
              color: 'white',
            }
          }}
        >
          {speedOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel sx={{ color: 'white' }}>Style</InputLabel>
        <Select
          value={value.experimental}
          label="Style"
          onChange={(e) => handleChange(e, 'experimental')}
          sx={{
            color: 'white',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '.MuiSvgIcon-root': {
              color: 'white',
            }
          }}
        >
          {experimentalOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
