const shouldUseYuGothicUiFont = (language?: string) => {
  if (!language || language.length === 0) {
    return false;
  }

  return language.toLocaleLowerCase() === 'ja-jp';
}

export default shouldUseYuGothicUiFont;